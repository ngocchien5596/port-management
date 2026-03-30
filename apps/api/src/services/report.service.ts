import prisma from '../lib/prisma';

export class ReportService {
    /**
     * Generates a comprehensive Ship Log (SLOG) for a completed voyage.
     */
    static async generateSlog(voyageId: string) {
        const voyage = await prisma.voyage.findUnique({
            where: { id: voyageId },
            include: {
                vessel: true,
                lane: true,
                product: true,
                events: {
                    orderBy: { createdAt: 'asc' }
                },
                incidents: {
                    orderBy: { startTime: 'asc' }
                },
                progress: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!voyage) throw new Error('Voyage not found');

        // Calculate effective working time (exclude RED incidents)
        const startTime = voyage.actualArrival || voyage.createdAt;
        const endTime = voyage.actualDeparture || new Date();

        // Simple productivity calculation
        const totalVolume = Number(voyage.totalVolume || 0);
        const totalProgress = voyage.progress.reduce((sum, p) => sum + Number(p.amount), 0);

        // Fetch all relevant incidents (Voyage-specific + Global + Lane-specific)
        const relevantIncidents = await prisma.incident.findMany({
            where: {
                OR: [
                    { voyageId: voyageId },
                    {
                        scope: 'GLOBAL',
                        startTime: { lte: endTime },
                        OR: [
                            { endTime: null },
                            { endTime: { gte: startTime } }
                        ]
                    },
                    {
                        scope: 'LANE',
                        laneId: voyage.laneId,
                        startTime: { lte: endTime },
                        OR: [
                            { endTime: null },
                            { endTime: { gte: startTime } }
                        ]
                    }
                ]
            },
            orderBy: { startTime: 'asc' }
        });

        // Downtime calculation (overlap with voyage duration)
        const downtimeMinutes = relevantIncidents
            .filter(i => i.severity === 'RED')
            .reduce((sum, i) => {
                const iStart = new Date(i.startTime).getTime();
                const iEnd = i.endTime ? new Date(i.endTime).getTime() : new Date().getTime();

                // Calculate overlap with voyage time range
                const overlapStart = Math.max(iStart, startTime.getTime());
                const overlapEnd = Math.min(iEnd, endTime.getTime());

                const overlapMinutes = Math.max(0, (overlapEnd - overlapStart) / (1000 * 60));
                return sum + overlapMinutes;
            }, 0);

        const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        const effectiveMinutes = Math.max(0, totalMinutes - downtimeMinutes);
        const productivityPerHour = effectiveMinutes > 0 ? (totalVolume / (effectiveMinutes / 60)) : 0;

        return {
            voyageId: voyage.id,
            vesselName: voyage.vessel.customerName,
            vesselCode: voyage.vessel.code,
            laneName: voyage.lane?.name || 'N/A',
            productName: voyage.product.name,
            totalVolume,
            progress: totalProgress,
            startTime,
            endTime,
            totalMinutes,
            downtimeMinutes,
            effectiveMinutes,
            productivityPerHour,
            events: voyage.events,
            incidents: relevantIncidents,
            rawProgress: voyage.progress
        };
    }

    /**
     * High-level operational statistics for the dashboard.
     */
    static async getOperationalStats() {
        const completedVoyages = await prisma.voyage.findMany({
            where: { status: 'HOAN_THANH' },
            include: { product: true }
        });

        const totalTonnage = completedVoyages.reduce((sum, v) => sum + Number(v.totalVolume || 0), 0);
        const avgProductivity = 0;

        return {
            totalVoyages: completedVoyages.length,
            totalTonnage,
            avgProductivity,
            activeIncidents: await prisma.incident.count({ where: { endTime: null } })
        };
    }

    /**
     * Get aggregated statistics for a specific time range.
     */
    static async getAggregatedStats(startDate: Date, endDate: Date) {
        // 1. Operational Stats
        const voyages = await prisma.voyage.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate }
            },
            include: {
                progress: true,
                product: true
            }
        });

        const totalThroughput = voyages.reduce((sum, v) =>
            sum + v.progress.reduce((pSum, p) => pSum + Number(p.amount), 0), 0);

        const avgProductivity = 0;

        // 2. Incident Stats
        const incidents = await prisma.incident.findMany({
            where: {
                startTime: { lte: endDate },
                OR: [
                    { endTime: null },
                    { endTime: { gte: startDate } }
                ]
            }
        });

        const totalDowntimeMinutes = incidents
            .filter(i => i.severity === 'RED')
            .reduce((sum, i) => {
                const start = Math.max(new Date(i.startTime).getTime(), startDate.getTime());
                const end = i.endTime
                    ? Math.min(new Date(i.endTime).getTime(), endDate.getTime())
                    : Math.min(new Date().getTime(), endDate.getTime());
                return sum + Math.max(0, (end - start) / 60000);
            }, 0);

        const mttrMinutes = incidents.length > 0
            ? incidents.reduce((sum, i) => {
                if (!i.endTime) return sum;
                return sum + (new Date(i.endTime).getTime() - new Date(i.startTime).getTime()) / 60000;
            }, 0) / incidents.filter(i => i.endTime).length || 0
            : 0;

        return {
            operational: {
                totalVoyages: voyages.length,
                totalThroughput,
                avgProductivity,
                completionRate: voyages.length > 0
                    ? (voyages.filter(v => v.status === 'HOAN_THANH').length / voyages.length) * 100
                    : 0
            },
            safety: {
                totalIncidents: incidents.length,
                totalDowntimeMinutes,
                mttrMinutes,
                incidentBreakdown: {
                    RED: incidents.filter(i => i.severity === 'RED').length,
                    YELLOW: incidents.filter(i => i.severity === 'YELLOW').length,
                    GREEN: incidents.filter(i => i.severity === 'GREEN').length
                }
            }
        };
    }

    /**
     * Get equipment utilization metrics.
     */
    static async getEquipmentUtilization(startDate: Date, endDate: Date) {
        // existing code ...
        const equipments = await prisma.equipment.findMany({
            include: {
                lane: true,
                incidents: {
                    where: {
                        startTime: { lte: endDate },
                        OR: [
                            { endTime: null },
                            { endTime: { gte: startDate } }
                        ]
                    }
                }
            }
        });

        return equipments.map(eq => {
            const downtimeMinutes = eq.incidents.reduce((sum, i) => {
                const start = Math.max(new Date(i.startTime).getTime(), startDate.getTime());
                const end = i.endTime
                    ? Math.min(new Date(i.endTime).getTime(), endDate.getTime())
                    : Math.min(new Date().getTime(), endDate.getTime());
                return sum + Math.max(0, (end - start) / 60000);
            }, 0);

            const totalMinutesInRange = (endDate.getTime() - startDate.getTime()) / 60000;
            const utilizationRate = totalMinutesInRange > 0
                ? ((totalMinutesInRange - downtimeMinutes) / totalMinutesInRange) * 100
                : 0;

            return {
                id: eq.id,
                name: eq.name,
                laneName: eq.lane.name,
                downtimeMinutes,
                utilizationRate
            };
        });
    }

    /**
     * Get Volume Report for Stacked Bar chart (by Day / Shift, and split by Product)
     */
    static async getVolumeReport(startDate: Date, endDate: Date) {
        const progressLogs = await prisma.voyageProgress.findMany({
            where: {
                endTime: { gte: startDate, lte: endDate }
            },
            include: {
                voyage: {
                    include: {
                        product: true,
                        vessel: true
                    }
                }
            },
            orderBy: { endTime: 'asc' }
        });

        // We return raw enriched logs. The frontend will do the pivot grouping (by day/shift and product)
        return progressLogs.map(log => ({
            id: log.id,
            voyageId: log.voyageId,
            vesselCode: log.voyage.vessel.code,
            vesselName: log.voyage.vessel.name,
            productCode: log.voyage.product.code,
            productName: log.voyage.product.name,
            amount: Number(log.amount),
            hours: Number(log.hours || 0),
            startTime: log.startTime,
            endTime: log.endTime,
            shiftCode: log.shiftCode || 'UNKNOWN'
        }));
    }

    /**
     * Get detailed productivity for equipments, including individual trends and KPIs.
     */
    static async getEquipmentAnalytics(startDate: Date, endDate: Date) {
        const equipments = await prisma.equipment.findMany({
            include: {
                lane: true,
                incidents: {
                    where: {
                        startTime: { lte: endDate },
                        OR: [{ endTime: null }, { endTime: { gte: startDate } }]
                    }
                },
                voyages: {
                    include: {
                        progress: {
                            where: {
                                endTime: { gte: startDate, lte: endDate },
                                hours: { gt: 0 }
                            }
                        }
                    }
                }
            }
        });

        const totalPeriodMinutes = (endDate.getTime() - startDate.getTime()) / 60000;

        return equipments.map(eq => {
            const allProgress = eq.voyages.flatMap(v => v.progress);
            const totalAmount = allProgress.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
            const totalHours = allProgress.reduce((sum: number, p: any) => sum + Number(p.hours || 0), 0);
            const avgActualNmph = totalHours > 0 ? totalAmount / totalHours : 0;
            const ratedCapacity = Number(eq.capacity || 100);

            // Downtime calculation
            const downtimeMinutes = eq.incidents.reduce((sum: number, i: any) => {
                const start = Math.max(new Date(i.startTime).getTime(), startDate.getTime());
                const end = i.endTime
                    ? Math.min(new Date(i.endTime).getTime(), endDate.getTime())
                    : Math.min(new Date().getTime(), endDate.getTime());
                return sum + Math.max(0, (end - start) / 60000);
            }, 0);

            const availability = totalPeriodMinutes > 0
                ? Math.max(0, 100 - (downtimeMinutes / totalPeriodMinutes) * 100)
                : 100;

            return {
                id: eq.id,
                name: eq.name,
                avgActualNmph,
                ratedCapacity,
                efficiencyIndex: ratedCapacity > 0 ? (avgActualNmph / ratedCapacity) * 100 : 0,
                availability,
                totalHours,
                totalAmount,
                logs: allProgress.map((p: any) => ({
                    endTime: p.endTime,
                    amount: Number(p.amount),
                    hours: Number(p.hours || 0),
                    productivity: Number(p.hours || 0) > 0 ? Number(p.amount) / Number(p.hours) : 0
                }))
            };
        });
    }

    /**
     * Get Port-wide productivity trend and overall KPIs.
     */
    static async getPortAnalytics(startDate: Date, endDate: Date) {
        const logs = await prisma.voyageProgress.findMany({
            where: {
                endTime: { gte: startDate, lte: endDate },
                hours: { gt: 0 }
            },
            include: {
                voyage: {
                    include: { equipment: true, vessel: true }
                }
            },
            orderBy: { endTime: 'asc' }
        });

        // Overall KPIs
        const totalActualAmount = logs.reduce((sum, l) => sum + Number(l.amount), 0);
        const totalHours = logs.reduce((sum, l) => sum + Number(l.hours || 0), 0);
        
        // Total Fleet Capacity (regardless of activity)
        const allEquipments = await prisma.equipment.findMany();
        const totalPortCapacity = allEquipments.reduce((sum, eq) => sum + Number(eq.capacity || 0), 0);
        
        // Efficiency vs. Total Fleet Potential
        const totalTheoreticalPotential = totalHours * totalPortCapacity; // Potential if ALL cranes worked ALL these hours? No.
        // Usually, Port-wide efficiency = Actual NMPH (avg) / Total Port Capacity
        const avgActualNmph = totalHours > 0 ? totalActualAmount / totalHours : 0;
        const efficiency = totalPortCapacity > 0 ? (avgActualNmph / totalPortCapacity) * 100 : 0;

        // Turnaround Time
        const completedVoyages = await prisma.voyage.findMany({
            where: {
                status: 'HOAN_THANH',
                actualDeparture: { gte: startDate, lte: endDate },
                actualArrival: { not: null }
            }
        });

        const totalTurnaroundHours = completedVoyages.reduce((sum, v) => {
            const hours = (v.actualDeparture!.getTime() - v.actualArrival!.getTime()) / 3600000;
            return sum + hours;
        }, 0);
        const avgTurnaroundTime = completedVoyages.length > 0 ? totalTurnaroundHours / completedVoyages.length : 0;

        return {
            summary: {
                avgNmph: avgActualNmph,
                totalAmount: totalActualAmount,
                avgTurnaroundTime,
                totalVoyages: completedVoyages.length,
                totalPortCapacity,
                efficiency
            },
            logs: logs.map(l => ({
                endTime: l.endTime,
                amount: Number(l.amount),
                hours: Number(l.hours || 0),
                ratedCapacity: totalPortCapacity, // Use total port capacity as the benchmark line
                voyage: {
                    id: l.voyage.id,
                    equipmentId: l.voyage.equipmentId
                }
            }))
        };
    }

    /**
     * Get Productivity Report (Legacy/Compatibility)
     */
    static async getProductivityReport(startDate: Date, endDate: Date) {
        const progressLogs = await prisma.voyageProgress.findMany({
            where: {
                endTime: { gte: startDate, lte: endDate },
                hours: { gt: 0 }
            },
            include: {
                voyage: {
                    include: {
                        equipment: true,
                        vessel: true
                    }
                }
            },
            orderBy: { endTime: 'asc' }
        });

        return progressLogs.map(log => {
            const amount = Number(log.amount);
            const hours = Number(log.hours);
            const productivity = hours > 0 ? amount / hours : 0;
            const equipmentCapacity = log.voyage.equipment ? Number(log.voyage.equipment.capacity || 100) : 100;

            return {
                id: log.id,
                voyageId: log.voyageId,
                vesselCode: log.voyage.vessel.code,
                equipmentName: log.voyage.equipment?.name || 'N/A',
                endTime: log.endTime,
                shiftCode: log.shiftCode || 'UNKNOWN',
                amount: amount,
                hours: hours,
                actualProductivity: productivity,
                ratedCapacity: equipmentCapacity
            };
        });
    }
}
