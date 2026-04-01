import prisma from '../lib/prisma';
import { emitEvent } from '../lib/socket';
import { NotificationService } from './notification.service';

export class VoyageService {
    static async getAll() {
        const voyages = await prisma.voyage.findMany({
            include: {
                vessel: true,

                product: true,
                events: {
                    include: {
                        employee: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                progress: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return Promise.all(voyages.map(v => this.attachTheoreticalEtd(v)));
    }

    static async getActive() {
        const voyages = await prisma.voyage.findMany({
            where: {
                status: { notIn: ['HOAN_THANH', 'HUY_BO'] }
            },
            include: {
                vessel: true,

                product: true,
                equipment: true,
                incidents: true,
                events: {
                    include: {
                        employee: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                progress: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        return Promise.all(voyages.map(v => this.attachTheoreticalEtd(v)));
    }

    static async getById(id: string) {
        const voyage = await prisma.voyage.findUnique({
            where: { id },
            include: {
                vessel: true,

                product: true,
                equipment: true,
                incidents: true,
                events: {
                    include: {
                        employee: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                progress: {
                    include: {
                        employee: true,
                        updatedBy: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                lane: true
            }
        });

        return this.attachTheoreticalEtd(voyage);
    }

    static async getSequenceNumber(laneId: string) {
        if (!laneId) return 0;

        // Count voyages that are active (not COMPLETED, CANCELLED or YIELDED) for this lane
        // This calculates the queue position.
        const count = await prisma.voyage.count({
            where: {
                laneId,
                status: { notIn: ['HOAN_THANH', 'HUY_BO'] },
                isYielded: false
            }
        });

        return count + 1; // Next sequence number in queue
    }

    static async create(data: {
        vesselId?: string; // Optional if creating new
        newVessel?: {
            code: string;
            customerName: string;
            capacity: number;
            customerPhone?: string;
            imoCode?: string;
        };
        laneId: string; // Required now
        productId: string;
        type: string;
        priority?: string;
        equipmentId?: string;
        eta?: Date;
        totalVolume?: number;
    }, userId: string) {
        return prisma.$transaction(async (tx) => {
            // 1. Handle Vessel Creation or Selection
            let vesselId = data.vesselId;

            if (!vesselId && data.newVessel) {
                // Check if vessel exists by code to avoid duplicate error in transaction
                const existingVessel = await tx.vessel.findUnique({
                    where: { code: data.newVessel.code }
                });

                if (existingVessel) {
                    vesselId = existingVessel.id;
                } else {
                    const newVessel = await tx.vessel.create({
                        data: {
                            code: data.newVessel.code,
                            name: (data.newVessel as any).name,
                            customerName: data.newVessel.customerName,
                            capacity: data.newVessel.capacity,
                            customerPhone: data.newVessel.customerPhone || null,
                            imoCode: data.newVessel.imoCode || null
                        }
                    });
                    vesselId = newVessel.id;
                }
            }

            if (!vesselId) throw new Error('Vessel ID or New Vessel Data is required');



            // 3. Calculate Queue Number & Auto-assign equipment
            let queueNo = 1;

            if (data.priority === 'EMERGENCY') {
                // Determine where to insert this emergency ship (after serving ships & existing emergency waiting ships)
                const activeVoyages = await tx.voyage.findMany({
                    where: { laneId: data.laneId, status: { notIn: ['HOAN_THANH', 'HUY_BO'] } },
                    orderBy: { queueNo: 'asc' }
                });

                let insertAtQueueNo = 1;
                for (const v of activeVoyages) {
                    if (['LAM_HANG', 'TAM_DUNG'].includes(v.status) || v.priority === 'EMERGENCY') {
                        insertAtQueueNo = Math.max(insertAtQueueNo, (v.queueNo || 0) + 1);
                    }
                }

                queueNo = insertAtQueueNo;

                // Shift down all subsequent ships by 1
                await tx.voyage.updateMany({
                    where: {
                        laneId: data.laneId,
                        status: { notIn: ['HOAN_THANH', 'HUY_BO'] },
                        queueNo: { gte: insertAtQueueNo }
                    },
                    data: {
                        queueNo: { increment: 1 }
                    }
                });
            } else {
                // Normal queue behavior
                queueNo = await tx.voyage.count({
                    where: {
                        laneId: data.laneId,
                        status: { notIn: ['HOAN_THANH', 'HUY_BO'] },
                        isYielded: false
                    }
                }) + 1;
            }

            let assignedEquipmentId = data.equipmentId;
            if (!assignedEquipmentId && data.laneId) {
                // If equipment is not explicitly provided, assign an available equipment from the lane
                const defaultEquipment = await tx.equipment.findFirst({
                    where: {
                        laneId: data.laneId,
                        manualStatus: { not: 'REPAIR' }
                    }
                });
                if (defaultEquipment) {
                    assignedEquipmentId = defaultEquipment.id;
                }
            }

            // Get Procedure Time config
            const procedureConfig = await tx.systemConfig.findUnique({ where: { key: 'PROCEDURE_TIME_HOURS' } });
            const procedureTimeHours = procedureConfig ? Number(procedureConfig.value) : 0;

            // 4. Create Voyage
            const voyage = await tx.voyage.create({
                data: {
                    vesselId,
                    laneId: data.laneId,
                    equipmentId: assignedEquipmentId,
                    productId: data.productId,
                    type: data.type,
                    priority: data.priority || 'NORMAL',
                    eta: data.eta,
                    totalVolume: data.totalVolume,
                    procedureTimeHours: procedureTimeHours,
                    queueNo,
                    status: 'NHAP',
                    readinessChecklist: {
                        equipment: false,
                        draft: false,
                        sample: false,
                        procedure: false,
                        weather: false
                    }
                },
                include: {
                    vessel: true,
                    product: true
                }
            });

            // 5. Create Initial Status Event
            if (userId) {
                await tx.voyageEvent.create({
                    data: {
                        voyageId: voyage.id,
                        type: 'STATUS_CHANGE',
                        title: 'Khởi tạo',
                        description: 'Khởi tạo chuyến tàu',
                        metadata: { status: 'NHAP' },
                        userId: userId
                    }
                });
            }


            // Side effect: Emit event (usually outside tx but fine here)
            emitEvent('VOYAGE_CREATED', voyage);

            return voyage;
        });
    }

    static async update(id: string, data: any) {
        // Implement updating a voyage. Only basic details for now.
        // For a full implementation, consider vessel, product, and lane logic.
        return prisma.voyage.update({
            where: { id },
            data: {
                priority: data.priority,
                eta: data.eta,
                totalVolume: data.totalVolume,
                type: data.type,
                // Do not update status here; use updateStatus
                ...(data.vesselId && { vesselId: data.vesselId }),
                ...(data.productId && { productId: data.productId }),
                ...(data.laneId && { laneId: data.laneId }),
                ...(data.equipmentId !== undefined && { equipmentId: data.equipmentId === '' ? null : data.equipmentId })
            },
            include: {
                vessel: true,
                product: true,
                equipment: true
            }
        });
    }

    static async delete(id: string) {
        const voyage = await prisma.voyage.findUnique({ where: { id } });
        if (!voyage) throw new Error('Voyage not found');

        if (voyage.status !== 'NHAP') {
            throw new Error('Chỉ có thể xóa chuyến tàu ở trạng thái Nháp (NHAP).');
        }

        return prisma.$transaction(async (tx) => {
            // Delete related events/progress first just in case
            await tx.voyageEvent.deleteMany({ where: { voyageId: id } });
            await tx.voyageProgress.deleteMany({ where: { voyageId: id } });
            await tx.incident.deleteMany({ where: { voyageId: id } });

            // Shift queueNo for subsequent active voyages
            if (voyage.laneId && voyage.queueNo) {
                await tx.voyage.updateMany({
                    where: {
                        laneId: voyage.laneId,
                        queueNo: { gt: voyage.queueNo },
                        status: { notIn: ['HOAN_THANH', 'HUY_BO'] }
                    },
                    data: {
                        queueNo: { decrement: 1 }
                    }
                });
            }

            // Finally, delete the voyage
            return tx.voyage.delete({ where: { id } });
        });
    }

    static async overrideEquipment({
        currentVoyageId,
        emergencyVoyageId,
        progressData,
        reason,
        userId
    }: {
        currentVoyageId: string;
        emergencyVoyageId: string;
        progressData: { amount: number; startTime?: string; endTime?: string; };
        reason?: string;
        userId?: string;
    }) {
        const result = await prisma.$transaction(async (tx) => {
            const currentVoyage = await tx.voyage.findUnique({ where: { id: currentVoyageId }, include: { vessel: true } });
            const emergencyVoyage = await tx.voyage.findUnique({ where: { id: emergencyVoyageId }, include: { vessel: true } });

            if (!currentVoyage || !emergencyVoyage) {
                throw new Error('Không tìm thấy chuyến tàu.');
            }

            if (currentVoyage.status !== 'LAM_HANG' || !currentVoyage.equipmentId) {
                throw new Error('Tàu phải nhường cẩu hiện không ở trạng thái Làm hàng hoặc không có cẩu.');
            }

            if (emergencyVoyage.priority !== 'EMERGENCY') {
                throw new Error('Tàu nhận cẩu không phải là tàu Khẩn cấp.');
            }

            const equipmentId = currentVoyage.equipmentId;

            // 1. Ghi nhận Progress chốt cho Tàu A
            const now = new Date();
            const lastProgress = await tx.voyageProgress.findFirst({
                where: { voyageId: currentVoyageId },
                orderBy: { createdAt: 'desc' }
            });
            const lastCumulative = lastProgress ? Number(lastProgress.cumulative) : 0;
            const amount = progressData.amount;
            const finalCumulative = lastCumulative + amount;

            const reqStartTime = progressData.startTime ? new Date(progressData.startTime) : null;
            const reqEndTime = progressData.endTime ? new Date(progressData.endTime) : null;

            if (amount > 0 || lastCumulative === 0) {

                let finalHours = 0;
                const defaultStartTime = lastProgress ? lastProgress.endTime : now;
                const startTimeToUse = reqStartTime || defaultStartTime;
                const endTimeToUse = reqEndTime || now;

                if (startTimeToUse && endTimeToUse) {
                    const startMs = startTimeToUse.getTime();
                    const endMs = endTimeToUse.getTime();
                    if (endMs > startMs) {
                        finalHours = (endMs - startMs) / (1000 * 60 * 60);
                    }
                }

                await tx.voyageProgress.create({
                    data: {
                        voyageId: currentVoyageId,
                        amount: amount > 0 ? amount : 0,
                        hours: finalHours,
                        productivity: finalHours > 0 && amount > 0 ? amount / finalHours : 0,
                        cumulative: finalCumulative,
                        startTime: startTimeToUse,
                        endTime: endTimeToUse,
                        notes: 'Chốt số liệu trước khi dời cẩu khẩn cấp',
                        ...(userId && { userId })
                    }
                });
            }
            // 2. Đẩy lùi QueueNo của Tàu A và các tàu đang xếp hàng phía trước Tàu B
            if (currentVoyage.laneId && currentVoyage.queueNo !== null && emergencyVoyage.queueNo !== null && emergencyVoyage.queueNo > currentVoyage.queueNo) {
                await tx.voyage.updateMany({
                    where: {
                        laneId: currentVoyage.laneId,
                        queueNo: {
                            gte: currentVoyage.queueNo,
                            lt: emergencyVoyage.queueNo
                        },
                        status: { notIn: ['HOAN_THANH', 'HUY_BO'] },
                        id: { not: emergencyVoyageId }
                    },
                    data: {
                        queueNo: { increment: 1 }
                    }
                });
            }

            // 3. Cập nhật Tàu A: Tạm dừng, rút cẩu
            // (Tàu A đã được +1 queueNo ở lệnh updateMany trên nếu thỏa mãn điều kiện)
            const updatedCurrentVoyage = await tx.voyage.update({
                where: { id: currentVoyageId },
                data: {
                    status: 'TAM_DUNG'
                }
            });

            // 4. Cập nhật Tàu B: Làm hàng, nhận cẩu, chiếm QueueNo ưu tiên cao nhất của Tàu A
            const updatedEmergencyVoyage = await tx.voyage.update({
                where: { id: emergencyVoyageId },
                data: {
                    equipmentId: equipmentId,
                    laneId: currentVoyage.laneId, 
                    queueNo: currentVoyage.queueNo
                }
            });

            // 4. Ghi Log Event cho Tàu A
            await tx.voyageEvent.create({
                data: {
                    voyageId: currentVoyageId,
                    type: 'STATUS_CHANGE',
                    title: 'Tạm dừng khẩn cấp',
                    description: `Bị đình chỉ để nhường cẩu cho chuyến ${emergencyVoyage.voyageCode} [${emergencyVoyage.vessel.code} - ${emergencyVoyage.vessel.name}]. ` + (reason ? `Lý do: ${reason}` : ''),
                    metadata: { status: 'TAM_DUNG', reason: 'EMERGENCY_OVERRIDE' },
                    userId
                }
            });


            // 5. Ghi Log Event cho Tàu B
            await tx.voyageEvent.create({
                data: {
                    voyageId: emergencyVoyageId,
                    type: 'STATUS_CHANGE',
                    title: 'Bắt đầu làm hàng khẩn cấp',
                    description: `Chiếm cẩu từ chuyến ${currentVoyage.voyageCode} [${currentVoyage.vessel.code} - ${currentVoyage.vessel.name}] do quyền ưu tiên Khẩn cấp.`,
                    metadata: { status: 'LAM_HANG', override: true },
                    userId
                }
            });

            return { updatedCurrentVoyage, updatedEmergencyVoyage, currentVoyage };
        });

        // 6. Recalculate and Emit Full Data for both voyages
        // This ensures cumulative values are correct and ETDs are updated
        const { voyage: finalCurrentVoyage } = await this.recalculateProgressAndEtd(currentVoyageId);
        const { voyage: finalEmergencyVoyage } = await this.recalculateProgressAndEtd(emergencyVoyageId);

        // Kịch bản 4: Push notification real-time (outside tx so Socket.IO emits)
        await NotificationService.createNotification({
            type: 'EMERGENCY_OVERRIDE',
            title: 'Thông báo: Tạm dừng nhường cẩu',
            message: `Tàu đã tạm dừng để nhường quyền ưu tiên cho tàu Khẩn cấp. Cẩu hiện đang bận.`,
            severity: 'CRITICAL',
            voyageId: currentVoyageId
        });

        return finalEmergencyVoyage;
    }

    static async updateStatus(id: string, status: any, reason?: string, userId?: string, force: boolean = false) {
        const currentVoyage = await prisma.voyage.findUnique({
            where: { id },
            include: { 
                product: true, 
                vessel: true,
                progress: true 
            }
        });

        if (!currentVoyage) throw new Error('Không tìm thấy chuyến tàu');

        let extraData: any = {};

        // INCOMPLETE PRODUCTION WARNING
        if (currentVoyage.status === 'LAM_HANG' && ['DO_MON_DAU_RA', 'HOAN_THANH', 'XONG'].includes(status) && !force) {
            const targetVolume = Number(currentVoyage.totalVolume || 0);
            if (targetVolume > 0) {
                const currentProduction = (currentVoyage as any).progress.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
                if (currentProduction < targetVolume) {
                    throw new Error(`[PROMPT_CONFIRM] Sản lượng hiện tại (${currentProduction.toLocaleString()} Tấn) thấp hơn sản lượng mục tiêu (${targetVolume.toLocaleString()} Tấn). Bạn có chắc chắn muốn kết thúc làm hàng không?`);
                }
            }
        }

        // Readiness Check for HANDLING
        if (status === 'LAM_HANG') {
            const checklist = currentVoyage.readinessChecklist as any;
            if (!checklist?.procedure || !checklist?.draft || !checklist?.equipment || !checklist?.sample) {
                // Kịch bản 5: User định chuyển trạng thái nhưng Checklist thiếu
                await NotificationService.createNotification({
                    type: 'READINESS_ERROR',
                    title: 'Cảnh báo An toàn',
                    message: `Bị chặn chuyển trạng thái sang Làm hàng do chưa đạt Checklist.`,
                    severity: 'WARNING',
                    voyageId: id
                });
                throw new Error('Không thể chuyển sang Làm hàng: Chưa hoàn thành đủ Checklist sẵn sàng.');
            }

            // Queue Sequence Enforcement Check
            if (currentVoyage.priority !== 'EMERGENCY' && currentVoyage.queueNo !== null && currentVoyage.laneId) {
                const earlierWAITINGVoyages = await prisma.voyage.count({
                    where: {
                        laneId: currentVoyage.laneId,
                        status: { notIn: ['HOAN_THANH', 'HUY_BO', 'LAM_HANG'] }, // Only check other WAITING voyages
                        queueNo: { lt: currentVoyage.queueNo }
                    }
                });
                if (earlierWAITINGVoyages > 0) {
                    throw new Error('Chưa đến lượt của chuyến tàu này. Vui lòng chuyển tàu lên Lốt Đầu Tiên trong Hàng đợi trước.');
                }
            }

            // SINGLE VESSEL OPERATING PER LANE VALIDATION
            if (currentVoyage.laneId) {
                const overlappingVoyages = await prisma.voyage.findMany({
                    where: {
                        laneId: currentVoyage.laneId,
                        status: 'LAM_HANG',
                        id: { not: id } // Exclude self
                    },
                    include: { vessel: true }
                });

                if (overlappingVoyages.length > 0) {
                    const occupying = overlappingVoyages[0];
                    const isOccupyingEmergency = (occupying as any).priority === 'EMERGENCY';
                    
                    if (currentVoyage.priority === 'EMERGENCY') {
                        throw new Error(`Đã có chuyến tàu ${occupying.voyageCode} [${occupying.vessel?.code || 'N/A'}] đang làm hàng tại bến này. Vui lòng sử dụng tính năng Nhường Cẩu Khẩn Cấp để lấy bến.`);
                    } else {
                        throw new Error(
                            `Đã có chuyến tàu ${occupying.voyageCode} [${occupying.vessel?.code || 'N/A'}] ${isOccupyingEmergency ? '(TÀU KHẨN CẤP)' : ''} đang làm hàng tại bến này. ` +
                            `Vui lòng chờ tàu này hoàn thành hoặc tạm dừng tàu đó trước khi quay lại làm hàng.`
                        );
                    }
                }
            }
            // AUTO-ASSIGN EQUIPMENT IF NULL
            let assignedEquipmentId = currentVoyage.equipmentId;
            if (!assignedEquipmentId && currentVoyage.laneId) {
                const defaultEquipment = await prisma.equipment.findFirst({
                    where: {
                        laneId: currentVoyage.laneId,
                        manualStatus: { notIn: ['REPAIR', 'MAINTENANCE'] }
                    }
                });
                if (!defaultEquipment) {
                    throw new Error('Không có thiết bị cẩu nào sẵn sàng tại Bến lệnh này để tiếp tục làm hàng.');
                }
                extraData.equipmentId = defaultEquipment.id;
            }
        }

        // Require reason for cancellation
        if (status === 'HUY_BO' && !reason) {
            throw new Error('Vui lòng nhập lý do khi hủy bỏ chuyến tàu.');
        }

        // If completing, set actual departure
        if (status === 'HOAN_THANH' || status === 'XONG') {
            extraData.actualDeparture = new Date();
        }

        if (status === 'HUY_BO' && reason) {
            extraData.cancelReason = reason;

            // Shift queueNo for subsequent active voyages if cancelled
            if (currentVoyage.laneId && currentVoyage.queueNo) {
                await prisma.voyage.updateMany({
                    where: {
                        laneId: currentVoyage.laneId,
                        queueNo: { gt: currentVoyage.queueNo },
                        status: { notIn: ['HOAN_THANH', 'HUY_BO'] }
                    },
                    data: {
                        queueNo: { decrement: 1 }
                    }
                });
            }
        }

        // If Pausing, we might want to log reason, but status change covers it.
        // Logic for ETD shift when Pausing is complex, we'll handle it simplistically via re-estimation 
        // OR we just let the next progress update fix the ETD.
        // For now, if PAUSED, ETD should probably preserve the *remaining duration* but start from *resume time*.
        // Detailed Paused logic is in Phase 2/3 refinement.

        const voyage = await prisma.voyage.update({
            where: { id },
            data: { status, ...extraData },
            include: {
                vessel: true,
                product: true,
                incidents: true
            }
        });

        // Optional: Emit event to socket
        // io.emit('voyage-status-changed', { voyageId: id, status });

        // Create VoyageEvent
        const statusMap: Record<string, string> = {
            'NHAP': 'Nháp',
            'THU_TUC': 'Làm thủ tục',
            'DO_MON_DAU_VAO': 'Đo mớn đầu vào',
            'LAY_MAU': 'Lấy mẫu',
            'LAM_HANG': 'Làm hàng',
            'DO_MON_DAU_RA': 'Đo mớn đầu ra',
            'HOAN_THANH': 'Hoàn thành',
            'TAM_DUNG': 'Tạm dừng',
            'HUY_BO': 'Hủy bỏ'
        };
        const statusLabel = statusMap[status] || status;
        let eventDescription = `Chuyển trạng thái sang: ${statusLabel}`;
        if (reason) eventDescription += ` - Lý do: ${reason}`;

        await prisma.voyageEvent.create({
            data: {
                voyageId: id,
                type: 'STATUS_CHANGE',
                title: 'Cập nhật trạng thái',
                description: eventDescription,
                metadata: { status: status },
                userId
            }
        });

        emitEvent('VOYAGE_UPDATED', voyage);

        // Fetch explicitly with includes to avoid type errors
        return await prisma.voyage.findUnique({
            where: { id: voyage.id },
            include: { product: true }
        });
    }

    static async addProgress(id: string, data: { amount: number, hours?: number, startTime?: string, endTime?: string, userId: string, notes?: string, shiftCode?: string }) {
        const voyage = await prisma.voyage.findUnique({
            where: { id },
            include: { product: true }
        });

        if (!voyage) throw new Error('Voyage not found');

        if (voyage.status !== 'LAM_HANG') {
            throw new Error('Chỉ được phép nhập sản lượng khi chuyến tàu đang ở trạng thái Làm hàng.');
        }

        // Calculate hours if startTime and endTime are provided
        let finalHours = Number(data.hours || 0);
        if (data.startTime && data.endTime) {
            const start = new Date(data.startTime).getTime();
            const end = new Date(data.endTime).getTime();
            if (end > start) {
                finalHours = (end - start) / (1000 * 60 * 60); // Convert ms to hours
            }
        }

        const productivity = finalHours > 0 ? Number(data.amount) / finalHours : 0;

        // 2. Create Progress Record
        const progress = await prisma.voyageProgress.create({
            data: {
                voyageId: id,
                amount: data.amount,
                hours: finalHours,
                startTime: data.startTime ? new Date(data.startTime) : null,
                endTime: data.endTime ? new Date(data.endTime) : null,
                productivity: productivity,
                cumulative: 0, // Will be set in recalculateProgressAndEtd
                userId: data.userId,
                notes: data.notes,
                shiftCode: data.shiftCode
            }
        });

        // Create VoyageEvent
        await prisma.voyageEvent.create({
            data: {
                voyageId: id,
                type: 'PROGRESS_UPDATE',
                title: 'Cập nhật sản lượng',
                description: `Cập nhật sản lượng: +${Number(data.amount).toLocaleString()} tấn${data.notes ? ` - Ghi chú: ${data.notes}` : ''}`,
                userId: data.userId
            }
        });

        return this.recalculateProgressAndEtd(id);
    }

    static async updateProgress(id: string, progressId: string, data: { amount?: number, hours?: number, startTime?: string, endTime?: string, notes?: string, shiftCode?: string, updatedById?: string }) {
        const voyageProgress = await prisma.voyageProgress.findUnique({ where: { id: progressId } });
        if (!voyageProgress || voyageProgress.voyageId !== id) throw new Error('Không tìm thấy bản ghi sản lượng');

        const voyage = await prisma.voyage.findUnique({ where: { id } });
        if (voyage?.status === 'HOAN_THANH') throw new Error('Không thể chỉnh sửa sản lượng khi chuyến tàu đã hoàn thành.');

        const updateData: any = { ...data };

        // Process startTime and endTime parsing
        if (data.startTime !== undefined) {
            updateData.startTime = data.startTime ? new Date(data.startTime) : null;
        }
        if (data.endTime !== undefined) {
            updateData.endTime = data.endTime ? new Date(data.endTime) : null;
        }

        // Determine final hours (priority to start/end time diff if provided, else hours, else existing)
        let finalHours = data.hours !== undefined ? Number(data.hours) : Number(voyageProgress.hours || 0);

        const finalStartTime = data.startTime !== undefined ? (data.startTime ? new Date(data.startTime) : null) : voyageProgress.startTime;
        const finalEndTime = data.endTime !== undefined ? (data.endTime ? new Date(data.endTime) : null) : voyageProgress.endTime;

        if (finalStartTime && finalEndTime) {
            const start = finalStartTime.getTime();
            const end = finalEndTime.getTime();
            if (end > start) {
                finalHours = (end - start) / (1000 * 60 * 60);
            } else {
                finalHours = 0;
            }
        }
        updateData.hours = finalHours;

        // If amount or hours changed, update productivity
        const finalAmount = data.amount !== undefined ? Number(data.amount) : Number(voyageProgress.amount);
        updateData.productivity = finalHours > 0 ? finalAmount / finalHours : 0;

        await prisma.voyageProgress.update({
            where: { id: progressId },
            data: {
                ...updateData,
                ...(data.shiftCode && { shiftCode: data.shiftCode }),
                updatedAt: new Date()
            }
        });

        // Detect changes for detailed logging
        const changes: string[] = [];

        // Normalize values for comparison
        const oldAmount = Number(voyageProgress.amount);
        const oldHours = Number(voyageProgress.hours || 0);
        const oldNotes = voyageProgress.notes || '';
        const oldShiftCode = voyageProgress.shiftCode || '';

        if (data.amount !== undefined && Number(data.amount) !== oldAmount) {
            changes.push(`Sản lượng: ${oldAmount.toLocaleString()} -> ${Number(data.amount).toLocaleString()} tấn`);
        }
        if (data.hours !== undefined && Number(data.hours) !== oldHours) {
            changes.push(`Giờ làm: ${oldHours} -> ${Number(data.hours)} giờ`);
        }
        if (data.notes !== undefined && (data.notes || '') !== oldNotes) {
            changes.push(`Ghi chú: "${oldNotes}" -> "${data.notes || ''}"`);
        }
        if (data.shiftCode !== undefined && data.shiftCode !== oldShiftCode) {
            changes.push(`Ca: "${oldShiftCode}" -> "${data.shiftCode}"`);
        }

        // Only create an event if something actually changed
        if (changes.length > 0) {
            const description = `Sửa bản ghi: ${changes.map(c => `[${c}]`).join(' ')}`;
            await prisma.voyageEvent.create({
                data: {
                    voyageId: id,
                    type: 'PROGRESS_UPDATE',
                    title: 'Sửa sản lượng',
                    description,
                    userId: data.updatedById
                }
            });
        }

        return this.recalculateProgressAndEtd(id);
    }

    static async deleteProgress(id: string, progressId: string, userId?: string) {
        const voyageProgress = await prisma.voyageProgress.findUnique({ where: { id: progressId } });
        if (!voyageProgress || voyageProgress.voyageId !== id) throw new Error('Không tìm thấy bản ghi sản lượng');

        const voyage = await prisma.voyage.findUnique({ where: { id } });
        if (voyage?.status === 'HOAN_THANH') throw new Error('Không thể xóa sản lượng khi chuyến tàu đã hoàn thành.');

        await prisma.voyageProgress.delete({ where: { id: progressId } });

        // Create VoyageEvent
        await prisma.voyageEvent.create({
            data: {
                voyageId: id,
                type: 'PROGRESS_UPDATE',
                title: 'Xóa bản ghi sản lượng',
                description: `Đã xóa bản ghi sản lượng: ${Number(voyageProgress.amount).toLocaleString()} tấn (Ngày tạo: ${new Date(voyageProgress.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })})`,
                userId: userId
            }
        });

        return this.recalculateProgressAndEtd(id);
    }

    static async recalculateProgressAndEtd(voyageId: string) {
        const voyage = await prisma.voyage.findUnique({
            where: { id: voyageId },
            include: { product: true }
        });
        if (!voyage) throw new Error('Voyage not found');

        // 1. Recalculate all cumulative values sequentially based on operational timeline
        const allLogs = await prisma.voyageProgress.findMany({
            where: { voyageId }
        });

        // Sort by actual operational end time (prioritize endTime over createdAt)
        const allProgress = allLogs.sort((a: any, b: any) => {
            const timeA = new Date(a.endTime || a.createdAt).getTime();
            const timeB = new Date(b.endTime || b.createdAt).getTime();
            return timeA - timeB;
        });

        let currentCumulative = 0;
        for (const prog of allProgress) {
            currentCumulative += Number(prog.amount);
            await prisma.voyageProgress.update({
                where: { id: prog.id },
                data: { cumulative: currentCumulative }
            });
        }

        // 2. Recalculate ETD based on Actual Net Productivity (NMPH)
        let capacity = await this.getEquipmentCapacity(voyage);
        if (capacity <= 0) capacity = 100; // Fallback for zero capacity

        const totalVolume = Number(voyage.totalVolume || 0);
        const remainingVolume = Math.max(0, totalVolume - currentCumulative);

        // Calculate actual net productivity (average NMPH) based on completed logs
        let totalNetHours = 0;
        let actualNmph = capacity; // Fallback to theoretical capacity initially

        if (allProgress.length > 0) {
            for (const p of allProgress) {
                let logHours = Number(p.hours) || 0;
                if (!logHours && p.startTime && p.endTime) {
                    const st = new Date(p.startTime).getTime();
                    const et = new Date(p.endTime).getTime();
                    if (et > st) logHours = (et - st) / (1000 * 60 * 60);
                }
                totalNetHours += logHours;
            }
            if (totalNetHours > 0 && currentCumulative > 0) {
                actualNmph = currentCumulative / totalNetHours;
            }
        }

        // Prevent division by zero or extremely small productivity leading to infinite ETD
        if (actualNmph <= 0) actualNmph = capacity;

        // Use Actual NMPH to predict remaining time
        const remainingHours = remainingVolume / actualNmph;

        // Get incidents to factor in downtime
        const voyageIncidents = await prisma.incident.findMany({
            where: { voyageId: voyageId },
            select: { startTime: true, createdAt: true, endTime: true }
        });

        let baseTimeForEtd = new Date();
        let newEtd: Date | null = null;

        if (allProgress.length > 0) {
            const lastLog = allProgress[allProgress.length - 1];
            if (lastLog.endTime) {
                baseTimeForEtd = new Date(lastLog.endTime);
            } else {
                baseTimeForEtd = new Date(lastLog.createdAt);
            }
        } else {
            const startTimeStr = voyage.actualArrival || voyage.eta || voyage.createdAt;
            baseTimeForEtd = startTimeStr ? new Date(startTimeStr) : new Date();
        }

        // Calculate Downtime specifically for the remaining work period
        const validIncidents = voyageIncidents.filter(inc => {
            const end = inc.endTime ? new Date(inc.endTime).getTime() : Date.now();
            return end > baseTimeForEtd.getTime(); // Incident must overlap with Future/Remaining Work Time
        });

        const intervals = validIncidents.map(inc => {
            const startStr = inc.startTime || inc.createdAt;
            const startMs = new Date(startStr).getTime();
            // Clamp start time to baseTimeForEtd so we only count downtime AFTER the base time
            const start = Math.max(startMs, baseTimeForEtd.getTime());
            const end = inc.endTime ? new Date(inc.endTime).getTime() : Date.now();
            return { start, end };
        }).filter(i => i.end > i.start).sort((a, b) => a.start - b.start);

        let downtimeAfterBaseMs = 0;
        if (intervals.length > 0) {
            let currentStart = intervals[0].start;
            let currentEnd = intervals[0].end;

            for (let i = 1; i < intervals.length; i++) {
                if (intervals[i].start <= currentEnd) {
                    currentEnd = Math.max(currentEnd, intervals[i].end);
                } else {
                    downtimeAfterBaseMs += (currentEnd - currentStart);
                    currentStart = intervals[i].start;
                    currentEnd = intervals[i].end;
                }
            }
            downtimeAfterBaseMs += (currentEnd - currentStart);
        }

        newEtd = new Date(baseTimeForEtd.getTime());
        // ETD = Base Time + Net Remaining Work Time + Incident Downtime + Procedure Time
        const procedureTimeMs = Number(voyage.procedureTimeHours || 0) * 60 * 60 * 1000;
        newEtd.setMilliseconds(newEtd.getMilliseconds() + (remainingHours * 60 * 60 * 1000) + downtimeAfterBaseMs + procedureTimeMs);

        const updatedVoyage = await prisma.voyage.update({
            where: { id: voyageId },
            data: { etd: newEtd },
            include: { vessel: true, product: true, lane: true, progress: { orderBy: { createdAt: 'desc' }, take: 1 } }
        });

        // Notification logic for Low Productivity (Kịch bản 2)
        if (updatedVoyage.status === 'LAM_HANG' && actualNmph > 0 && actualNmph < capacity * 0.8) {
            await NotificationService.createNotification({
                type: 'LOW_PRODUCTIVITY',
                title: 'Cảnh báo Năng suất',
                message: `Đang làm hàng với năng suất thấp. Hiện tại: ${actualNmph.toFixed(1)} tấn/giờ (Tiêu chuẩn: ${capacity} tấn/giờ).`,
                severity: 'WARNING',
                voyageId: voyageId
            });
        } else if (updatedVoyage.status === 'LAM_HANG' && actualNmph >= capacity * 0.8) {
            // Auto-resolve if productivity rebounds
            await NotificationService.resolveNotification(voyageId, 'LOW_PRODUCTIVITY');
        }

        const voyageWithTheoretical = await this.attachTheoreticalEtd(updatedVoyage);
        emitEvent('VOYAGE_UPDATED', voyageWithTheoretical);

        return { voyage: voyageWithTheoretical };
    }

    static async updateReadiness(id: string, checklist: any) {
        const voyage = await prisma.voyage.update({
            where: { id },
            data: { readinessChecklist: checklist },
            include: { vessel: true, lane: true, product: true }
        });

        // Create VoyageEvent
        await prisma.voyageEvent.create({
            data: {
                voyageId: id,
                type: 'CHECKLIST_UPDATE',
                title: 'Cập nhật Checklist',
                description: `Cập nhật Checklist Sẵn sàng Làm hàng`,
                metadata: { status: 'THU_TUC' } // Or appropriate context
            }
        });

        emitEvent('VOYAGE_UPDATED', voyage);
        return voyage;
    }

    static async addIncident(id: string, data: { type: string, severity: string, description: string, userId: string }) {
        const incident = await prisma.incident.create({
            data: {
                voyageId: id,
                ...data
            }
        });

        // If high severity, we might want to automatically change voyage color or something
        // but for now just create the log.

        const voyage = await prisma.voyage.findUnique({
            where: { id },
            include: { vessel: true, product: true, incidents: true }
        });

        emitEvent('VOYAGE_UPDATED', voyage);
        return incident;
    }

    private static async getEquipmentCapacity(voyage: any) {
        let capacity = 0;

        // Try to get capacity of the specifically assigned equipment
        if (voyage.equipmentId) {
            const equipment = await prisma.equipment.findUnique({
                where: { id: voyage.equipmentId }
            });

            if (equipment && equipment.manualStatus !== 'REPAIR') {
                capacity = Number(equipment.capacity || 0);
            }
        } else if (voyage.laneId && voyage.productId) {
            // Fallback for old records: try to get total capacity of equipment in the lane that matches the product
            const equipments = await prisma.equipment.findMany({
                where: {
                    laneId: voyage.laneId,
                    products: {
                        some: { id: voyage.productId }
                    },
                    manualStatus: { not: 'REPAIR' } // Exclude equipment under repair
                }
            });

            if (equipments.length > 0) {
                capacity = equipments.reduce((sum, eq: any) => sum + Number(eq.capacity || 0), 0);
            }
        }


        return capacity;
    }

    private static async attachTheoreticalEtd(voyage: any) {
        if (!voyage) return null;

        const capacity = await this.getEquipmentCapacity(voyage);
        const totalVolume = Number(voyage.totalVolume || 0);

        const startTimeStr = voyage.actualArrival || voyage.eta || voyage.createdAt;
        const startTime = startTimeStr ? new Date(startTimeStr) : new Date();

        // 1. Calculate Theoretical Data (only if capacity > 0)
        let theoreticalEtd = null;
        let theoreticalProgress = 0;
        const procedureHours = Number(voyage.procedureTimeHours || 0);

        if (capacity > 0 && totalVolume > 0) {
            const durationHours = (totalVolume / capacity) + procedureHours;
            theoreticalEtd = new Date(startTime.getTime() + (durationHours * 60 * 60 * 1000)).toISOString();

            const now = new Date();
            if (now > startTime) {
                const hoursPassed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                theoreticalProgress = Math.min(totalVolume, hoursPassed * capacity);
            }
        }

        // 2. Calculate Performance Trend Data Points (Actuals always available)
        const progressLogs = [...(voyage.progress || [])].sort(
            (a: any, b: any) => {
                const timeA = new Date(a.endTime || a.createdAt).getTime();
                const timeB = new Date(b.endTime || b.createdAt).getTime();
                return timeA - timeB;
            }
        );

        let runningTheoreticalCumulative = 0;
        let totalNetHours = 0;

        let chartStartTime = startTime;
        if (progressLogs.length > 0) {
            const earliestTimeMs = Math.min(...progressLogs.map((p: any) => new Date(p.startTime || p.createdAt).getTime()));
            chartStartTime = new Date(earliestTimeMs);
        }

        const performanceTrendData = [
            {
                timestamp: chartStartTime.toISOString(),
                actualCumulative: 0,
                theoreticalCumulative: 0,
                label: chartStartTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            },
            ...progressLogs.map((p: any) => {
                // Support both Date objects (from DB) and strings
                const logTimeStr = p.endTime 
                    ? (typeof p.endTime === 'string' ? p.endTime : p.endTime.toISOString())
                    : (typeof p.createdAt === 'string' ? p.createdAt : p.createdAt.toISOString());
                
                const logTime = new Date(logTimeStr);

                // Calculate hours for this specific record
                let logHours = Number(p.hours) || 0;
                if (!logHours && p.startTime && p.endTime) {
                    const st = new Date(p.startTime).getTime();
                    const et = new Date(p.endTime).getTime();
                    if (et > st) {
                        logHours = (et - st) / (1000 * 60 * 60);
                    }
                }

                // Accumulate theoretical progress only during the worked hours
                runningTheoreticalCumulative += logHours * capacity;
                totalNetHours += logHours;

                const actualQty = Number(p.cumulative);
                const theorQty = capacity > 0 ? runningTheoreticalCumulative : 0;

                return {
                    timestamp: logTimeStr,
                    actualCumulative: actualQty,
                    theoreticalCumulative: theorQty,
                    isOverTheoretical: actualQty < theorQty,
                    label: logTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                };
            })
        ];

        // Ensure current total is calculated from the most recently worked record
        const latestProgress = [...progressLogs].reverse()[0];
        const currentTotal = latestProgress ? Number(latestProgress.cumulative) : 0;

        // Compute new Port KPIs
        const netProductivity = totalNetHours > 0 ? currentTotal / totalNetHours : 0;
        const equipmentEfficiency = totalNetHours > 0 && capacity > 0
            ? (currentTotal / (totalNetHours * capacity)) * 100
            : 0;


        return {
            ...voyage,
            theoreticalEtd,
            equipmentCapacity: capacity || 0,
            theoreticalProgress,
            performanceTrendData,
            netProductivity,
            equipmentEfficiency
        };
    }



    static async reorderQueue(updates: { id: string, queueNo: number, laneId?: string, equipmentId?: string | null }[]) {
        return prisma.$transaction(async (tx) => {
            const results = [];
            for (const item of updates) {
                const data: any = { queueNo: item.queueNo };
                if (item.laneId) data.laneId = item.laneId;
                if (item.equipmentId !== undefined) {
                    data.equipmentId = item.equipmentId;
                }

                results.push(
                    tx.voyage.update({
                        where: { id: item.id },
                        data
                    })
                );
            }

            // Wait for all updates
            await Promise.all(results);

            // Re-fetch to return with basic includes
            const finalVoyages = await tx.voyage.findMany({
                where: { id: { in: updates.map(u => u.id) } },
                include: { vessel: true, product: true }
            });

            // Optionally emit event if socket mapping exists
            emitEvent('VOYAGE_QUEUE_REORDERED', finalVoyages);

            return finalVoyages;
        });
    }

    static async getPublicTracking(params: { voyageId?: string, voyageCode?: number, phone: string }) {
        const { voyageId, voyageCode, phone } = params;
        const normalizedPhone = phone.trim();

        const voyage = await prisma.voyage.findFirst({
            where: {
                ...(voyageId ? { id: voyageId } : { voyageCode }),
                vessel: {
                    customerPhone: normalizedPhone
                }
            },
            include: {
                vessel: true,
                product: true,
                events: {
                    orderBy: { createdAt: 'desc' }
                },
                progress: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // Debug logging for troubleshooting data mismatches
        if (!voyage && (voyageId || voyageCode)) {
            const existsByCode = await prisma.voyage.findFirst({
                where: voyageId ? { id: voyageId } : { voyageCode },
                include: { vessel: true }
            });
            
            if (existsByCode) {
                console.log(`[PublicTracking] Voyage found by code ${voyageCode || voyageId}, but phone mismatch. Provided: "${normalizedPhone}", Expected: "${existsByCode.vessel.customerPhone}"`);
            }
        }

        if (!voyage) return null;

        // Attach theoretical ETD and performance data using existing logic
        const detailedVoyage = await this.attachTheoreticalEtd(voyage);

        // Sanitize data for public consumption
        return {
            id: detailedVoyage.id,
            voyageCode: detailedVoyage.voyageCode,
            vessel: {
                name: detailedVoyage.vessel.name,
                code: detailedVoyage.vessel.code,
            },
            product: {
                name: detailedVoyage.product.name,
                unit: detailedVoyage.product.unit,
            },
            status: detailedVoyage.status,
            eta: detailedVoyage.eta,
            etd: detailedVoyage.etd,
            actualArrival: detailedVoyage.actualArrival,
            actualDeparture: detailedVoyage.actualDeparture,
            totalVolume: detailedVoyage.totalVolume,
            theoreticalEtd: detailedVoyage.theoreticalEtd,
            equipmentEfficiency: detailedVoyage.equipmentEfficiency,
            // Sanitize logs
            logs: (detailedVoyage.events || []).map((e: any) => ({
                id: e.id,
                type: e.type,
                title: e.title,
                description: e.description,
                createdAt: e.createdAt
            })),
            // Sanitize progress
            progress: (detailedVoyage.progress || []).map((p: any) => ({
                id: p.id,
                amount: p.amount,
                cumulative: p.cumulative,
                createdAt: p.createdAt
            }))
        };
    }
}
