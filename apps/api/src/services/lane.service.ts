import prisma from '../lib/prisma';
import { EquipmentService } from './equipment.service';

export class LaneService {
    static async getAll() {
        const lanes = await prisma.lane.findMany({
            include: {
                equipments: {
                    include: {
                        lane: {
                            include: {
                                voyages: {
                                    where: { status: 'LAM_HANG' }
                                }
                            }
                        },
                        voyages: {
                            where: { status: 'LAM_HANG' }
                        },
                        products: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return lanes.map(lane => ({
            ...lane,
            equipments: lane.equipments.map(eq => EquipmentService.calculateStatus(eq))
        }));
    }

    static async getById(id: string) {
        const lane = await prisma.lane.findUnique({
            where: { id },
            include: {
                equipments: {
                    include: {
                        lane: {
                            include: {
                                voyages: {
                                    where: { status: 'LAM_HANG' }
                                }
                            }
                        },
                        voyages: {
                            where: { status: 'LAM_HANG' }
                        },
                        products: true
                    }
                }
            }
        });

        if (!lane) return null;

        return {
            ...lane,
            equipments: lane.equipments.map(eq => EquipmentService.calculateStatus(eq))
        };
    }

    static async create(data: { name: string }) {
        return prisma.lane.create({
            data
        });
    }

    static async update(id: string, data: Partial<{ name: string }>) {
        return prisma.lane.update({
            where: { id },
            data
        });
    }

    static async delete(id: string) {
        return prisma.lane.delete({
            where: { id }
        });
    }

    static async suggest(productId: string, eta: Date) {
        // 1. Get all lanes with their equipment and cargo types
        const lanes = await prisma.lane.findMany({
            include: {
                equipments: {
                    include: {
                        products: true
                    }
                },
                voyages: {
                    where: {
                        status: { notIn: ['HOAN_THANH', 'HUY_BO'] },
                        isYielded: false
                    },
                    select: {
                        etd: true,
                        status: true,
                        totalVolume: true,
                        actualArrival: true,
                        eta: true,
                        createdAt: true,
                        procedureTimeHours: true,
                        equipment: {
                            select: { capacity: true }
                        }
                    }
                }
            }
        });

        // 2. Get Product info to check type match
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error('Không tìm thấy loại hàng hóa');

        const candidates = lanes.map(lane => {
            // Check Capability: Filter out lanes that don't have equipment for this product
            let validEquipments = lane.equipments;

            if (lane.equipments.length > 0) {
                validEquipments = lane.equipments.filter(eq => {
                    // If equipment has defined supported products, check if product matches by ID
                    if (eq.products && eq.products.length > 0) {
                        return eq.products.some((p: any) =>
                            p.id === product.id
                        );
                    }
                    return true; // No restrictions
                });

                if (validEquipments.length === 0) {
                    // console.log(`[LaneSuggest] Lane ${lane.name} rejected: No capable equipment for "${product.name}"`);
                    return null; // Skip this lane
                }
            } else {
                console.log(`[LaneSuggest] Lane ${lane.name} has NO equipment -> Auto-Suggest (Fallback)`);
            }

            // Check Occupancy
            // STICT RULE: Lane is FREE only if NO active voyages.
            const activeVoyages = lane.voyages;
            const isFree = activeVoyages.length === 0;

            let estimatedWaitTime = 0;
            let queueEndTime = eta.getTime();

            if (!isFree) {
                // Find Max ETD of active voyages (compare theoreticalEtd and actual etd)
                const maxEtd = activeVoyages.reduce((max, v) => {
                    const etdTime = v.etd ? v.etd.getTime() : 0;

                    // Simple local calculation of theoretical ETD
                    let theoTime = 0;
                    const totalVolume = Number(v.totalVolume || 0);
                    if (totalVolume > 0 && v.equipment) {
                        const capacityRaw = (v.equipment as any).capacity;
                        const capacity = Number(capacityRaw || 0);
                        if (capacity > 0) {
                            const startTimeStr = v.actualArrival || v.eta || v.createdAt;
                            const startTime = startTimeStr ? new Date(startTimeStr).getTime() : Date.now();
                            const procedureHours = Number(v.procedureTimeHours || 0);
                            const durationHours = (totalVolume / capacity) + procedureHours;
                            theoTime = startTime + (durationHours * 60 * 60 * 1000);
                        }
                    }

                    // Lấy thời gian muộn nhất giữa ETD thực tế, ETD lý thuyết và giờ hiện tại
                    const voyageMaxTime = Math.max(etdTime, theoTime, Date.now());

                    return voyageMaxTime > max ? voyageMaxTime : max;
                }, Date.now());

                queueEndTime = maxEtd;
                // Trừ đi giờ cập bến (ETA) của tàu mới để tính thời gian chờ thực tế của chuyến này
                estimatedWaitTime = Math.max(0, maxEtd - eta.getTime());
            }

            return {
                id: lane.id,
                name: lane.name,
                isFree,
                activeCount: activeVoyages.length,
                estimatedWaitTime, // ms
                queueEndTime,
                equipments: validEquipments
            };
        });

        // Filter valid candidates
        const validCandidates = candidates.filter(c => c !== null);

        // 3. Sort Candidates
        // Priority 1: FREE
        // Priority 2: Earliest Availability
        validCandidates.sort((a: any, b: any) => {
            if (a.isFree && !b.isFree) return -1;
            if (!a.isFree && b.isFree) return 1;
            return a.queueEndTime - b.queueEndTime;
        });

        // 4. Format Output
        return validCandidates.map((c: any) => {
            let reason = '';
            if (c.isFree) {
                reason = `Luồng Rảnh (Sẵn sàng ngay)`;
            } else {
                const waitHours = Math.round(c.estimatedWaitTime / (1000 * 60 * 60));
                reason = `Luồng Bận (${c.activeCount} tàu đang chờ/làm hàng) - Dự kiến chờ ${waitHours}h`;
            }
            return {
                ...c,
                reason,
                equipments: c.equipments.map((e: any) => ({
                    id: e.id,
                    code: e.code,
                    name: e.name
                }))
            };
        });
    }
}
