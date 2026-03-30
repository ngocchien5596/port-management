import prisma from '../lib/prisma';
import { IncidentScope } from '@prisma/client';
import { VoyageService } from './voyage.service';

export class EquipmentService {
    static async getAll() {
        const equipments = await prisma.equipment.findMany({
            include: {
                lane: {
                    include: {
                        voyages: {
                            where: {
                                status: 'LAM_HANG'
                            }
                        }
                    }
                },
                voyages: {
                    where: {
                        status: 'LAM_HANG'
                    },
                    include: { vessel: true }
                },
                products: true
            },
            orderBy: { name: 'asc' }
        });

        return equipments.map(eq => this.calculateStatus(eq));
    }

    static async getById(id: string) {
        const eq = await prisma.equipment.findUnique({
            where: { id },
            include: {
                lane: {
                    include: {
                        voyages: {
                            where: {
                                status: 'LAM_HANG'
                            }
                        }
                    }
                },
                voyages: {
                    where: {
                        status: 'LAM_HANG'
                    },
                    include: { vessel: true }
                },
                products: true
            }
        });

        return eq ? this.calculateStatus(eq) : null;
    }

    public static calculateStatus(eq: any) {
        // Business logic: manualStatus overrides auto-detection
        let status = eq.manualStatus || 'IDLE';

        if (!eq.manualStatus) {
            // Auto-detection: Busy if any voyage using THIS equipment is 'LAM_HANG'
            const isBusy = eq.voyages?.length > 0;
            status = isBusy ? 'BUSY' : 'IDLE';
        }

        return { ...eq, status };
    }

    static async create(data: { name: string; laneId: string; capacity?: number; productIds?: string[] }) {
        const { productIds, ...rest } = data;
        const eq = await prisma.equipment.create({
            data: {
                ...rest,
                products: productIds ? {
                    connect: productIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                lane: {
                    include: {
                        voyages: {
                            where: { status: 'LAM_HANG' }
                        }
                    }
                },
                voyages: {
                    where: { status: 'LAM_HANG' },
                    include: { vessel: true }
                },
                products: true
            }
        });
        return this.calculateStatus(eq);
    }

    static async update(id: string, data: Partial<{ name: string; laneId: string; capacity: number; productIds: string[]; manualStatus: string }>) {
        const { productIds, ...rest } = data;
        const eq = await prisma.equipment.update({
            where: { id },
            data: {
                ...rest,
                products: productIds ? {
                    set: productIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                lane: {
                    include: {
                        voyages: {
                            where: { status: 'LAM_HANG' }
                        }
                    }
                },
                voyages: {
                    where: { status: 'LAM_HANG' },
                    include: { vessel: true }
                },
                products: true
            }
        });
        return this.calculateStatus(eq);
    }

    static async updateStatus(id: string, data: { status: string; userId?: string; description?: string }) {
        const { status, userId, description } = data;

        // Use a transaction to ensure both update and event creation succeed
        const result = await prisma.$transaction(async (tx) => {
            const equipment = await tx.equipment.update({
                where: { id },
                data: { manualStatus: status === 'AUTO' ? null : status },
                include: {
                    lane: {
                        include: {
                            voyages: {
                                where: { status: 'LAM_HANG' }
                            }
                        }
                    },
                    voyages: {
                        where: { status: 'LAM_HANG' },
                        include: { vessel: true }
                    }
                }
            });

            const activeVoyages = equipment.voyages || [];
            let affectedVoyageIds: string[] = [];

            const STATUS_MAP: Record<string, string> = {
                'AUTO': 'Tự động',
                'MAINTENANCE': 'Bảo trì',
                'REPAIR': 'Sửa chữa',
                'IDLE': 'Sẵn sàng',
                'BUSY': 'Đang hoạt động'
            };
            const statusName = STATUS_MAP[status] || status;

            await tx.equipmentEvent.create({
                data: {
                    equipmentId: id,
                    type: 'STATUS_CHANGE',
                    title: `Thay đổi trạng thái sang ${statusName}`,
                    description,
                    userId
                }
            });

            // Automatically create Incident for Repair/Maintenance
            if (status === 'REPAIR' || status === 'MAINTENANCE') {
                const severity = status === 'REPAIR' ? 'RED' : 'YELLOW';
                const incidentType = status === 'REPAIR' ? 'SỬA CHỮA THIẾT BỊ' : 'BẢO TRÌ THIẾT BỊ';

                const masterIncident = await tx.incident.create({
                    data: {
                        scope: IncidentScope.EQUIPMENT,
                        equipmentId: id,
                        type: incidentType,
                        severity: severity,
                        description: description || `Cẩu/Thiết bị được chuyển sang trạng thái ${status === 'REPAIR' ? 'Sửa chữa' : 'Bảo trì'}`,
                        userId: userId || 'SYSTEM',
                        startTime: new Date()
                    }
                });

                if (activeVoyages.length > 0) {
                    // CASCADING: Create Child Incidents for each active voyage
                    await tx.incident.createMany({
                        data: activeVoyages.map(v => ({
                            scope: IncidentScope.VOYAGE,
                            voyageId: v.id,
                            parentId: masterIncident.id,
                            type: incidentType,
                            severity: severity,
                            description: description || `Trì hoãn do thiết bị ${equipment.name} chuyển sang trạng thái ${status === 'REPAIR' ? 'Sửa chữa' : 'Bảo trì'}`,
                            userId: userId || 'SYSTEM',
                            startTime: masterIncident.startTime
                        }))
                    });

                    // Create VoyageEvent for history
                    await tx.voyageEvent.createMany({
                        data: activeVoyages.map(v => ({
                            voyageId: v.id,
                            type: 'INCIDENT_CREATED',
                            title: `Sự cố: ${incidentType}`,
                            description: description || `Chuyến tàu bị ảnh hưởng do cẩu/thiết bị ${equipment.name} chuyển sang trạng thái ${status === 'REPAIR' ? 'Sửa chữa' : 'Bảo trì'}`,
                            userId: userId
                        }))
                    });

                    affectedVoyageIds.push(...activeVoyages.map(v => v.id));
                }
            }

            // Automatically resolve Incidents when changed back to AUTO
            if (status === 'AUTO') {
                const unresolvedIncidents = await tx.incident.findMany({
                    where: { equipmentId: id, endTime: null }
                });

                if (unresolvedIncidents.length > 0) {
                    const resolveTime = new Date();

                    // Resolve Master incidents
                    await tx.incident.updateMany({
                        where: { equipmentId: id, endTime: null },
                        data: { endTime: resolveTime }
                    });

                    // Resolve Child incidents
                    const parentIds = unresolvedIncidents.map(i => i.id);
                    await tx.incident.updateMany({
                        where: { parentId: { in: parentIds }, endTime: null },
                        data: { endTime: resolveTime }
                    });

                    const childIncidents = await tx.incident.findMany({
                        where: { parentId: { in: parentIds } }
                    });
                    const voyageIdsWithChildIncidents = childIncidents.map(c => c.voyageId).filter(Boolean) as string[];

                    if (voyageIdsWithChildIncidents.length > 0) {
                        await tx.voyageEvent.createMany({
                            data: voyageIdsWithChildIncidents.map(vId => ({
                                voyageId: vId,
                                type: 'INCIDENT_RESOLVED',
                                title: `Khắc phục sự cố thiết bị`,
                                description: `Thiết bị ${equipment.name} đã trực chiến trở lại.`,
                                userId: userId
                            }))
                        });
                        affectedVoyageIds.push(...voyageIdsWithChildIncidents);
                    }
                }
            }

            return { equipment, affectedVoyageIds };
        });

        // Recalculate ETA/ETD for all affected voyages after transaction commits
        for (const vId of new Set(result.affectedVoyageIds)) {
            await VoyageService.recalculateProgressAndEtd(vId).catch(console.error);
        }

        return this.calculateStatus(result.equipment);
    }

    static async getHistory(id: string) {
        const events = await prisma.equipmentEvent.findMany({
            where: { equipmentId: id },
            include: {
                employee: { select: { fullName: true, employeeCode: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const voyages = await prisma.voyage.findMany({
            where: { equipmentId: id },
            select: { id: true, voyageCode: true, vessel: { select: { code: true } } }
        });
        const voyageMap = new Map(voyages.map(v => [v.id, v]));

        const progressRecords = await prisma.voyageProgress.findMany({
            where: { voyageId: { in: voyages.map(v => v.id) } },
            include: {
                employee: { select: { fullName: true, employeeCode: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        const unifiedHistory = [
            ...events.map(e => ({
                id: e.id,
                type: e.type,
                title: e.title,
                description: e.description,
                createdAt: e.createdAt,
                employee: e.employee
            })),
            ...progressRecords.map(p => {
                const v = voyageMap.get(p.voyageId);
                const vesselIdStr = v ? `${v.voyageCode} - ${v.vessel?.code || 'Vô danh'}` : 'Không rõ';
                return {
                    id: p.id,
                    type: 'CARGO_PROGRESS',
                    title: `Báo cáo sản lượng: ${Number(p.amount)} Tấn`,
                    description: `Phục vụ: ${vesselIdStr} | Thời lượng: ${Number(p.hours)}h | Năng suất: ${Number(p.productivity)} T/h${p.notes ? ` | Ghi chú: ${p.notes}` : ''}`,
                    createdAt: p.createdAt,
                    employee: p.employee
                };
            })
        ];

        return unifiedHistory.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 100);
    }

    static async getKpi(id: string) {
        const equipment = await prisma.equipment.findUnique({
            where: { id },
            select: { capacity: true }
        });

        if (!equipment) throw new Error('Equipment not found');

        const voyages = await prisma.voyage.findMany({
            where: { equipmentId: id },
            select: { id: true }
        });

        const voyageIds = voyages.map(v => v.id);

        const progressRecords = await prisma.voyageProgress.findMany({
            where: { voyageId: { in: voyageIds } },
            orderBy: { createdAt: 'asc' }
        });

        let totalVolume = 0;
        let totalHours = 0;

        const dailyStats: Record<string, { date: string, volume: number, hours: number }> = {};

        progressRecords.forEach(record => {
            const vol = Number(record.amount || 0);
            const hrs = Number(record.hours || 0);

            totalVolume += vol;
            totalHours += hrs;

            const dateStr = (record.startTime || record.createdAt).toISOString().split('T')[0];

            if (!dailyStats[dateStr]) {
                dailyStats[dateStr] = { date: dateStr, volume: 0, hours: 0 };
            }
            dailyStats[dateStr].volume += vol;
            dailyStats[dateStr].hours += hrs;
        });

        const dailyHistory = Object.values(dailyStats).map(stat => ({
            date: stat.date,
            volume: stat.volume,
            hours: stat.hours,
            productivity: stat.hours > 0 ? (stat.volume / stat.hours) : 0,
            expectedCapacity: Number(equipment.capacity || 0)
        })).sort((a, b) => a.date.localeCompare(b.date));

        const avgProductivity = totalHours > 0 ? totalVolume / totalHours : 0;
        const capacity = Number(equipment.capacity || 0);
        const efficiency = capacity > 0 ? (avgProductivity / capacity) * 100 : 0;

        const repairIncidents = await prisma.incident.findMany({
            where: {
                equipmentId: id,
                type: 'SỬA CHỮA THIẾT BỊ'
            }
        });

        let downtimeHours = 0;
        const now = new Date();
        repairIncidents.forEach(inc => {
            const start = new Date(inc.startTime).getTime();
            const end = inc.endTime ? new Date(inc.endTime).getTime() : now.getTime();
            downtimeHours += (end - start) / (1000 * 60 * 60);
        });

        return {
            totalVolume,
            totalHours,
            avgProductivity,
            efficiency,
            downtimeHours: Number(downtimeHours.toFixed(1)),
            dailyHistory
        };
    }

    static async delete(id: string) {
        return prisma.equipment.delete({
            where: { id }
        });
    }
}
