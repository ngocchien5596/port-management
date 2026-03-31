import prisma from '../lib/prisma';
import { IncidentScope } from '@prisma/client';
import { VoyageService } from './voyage.service';

export class IncidentService {
    /**
     * Fetch all incidents with filtering by scope, type, severity, and active status.
     */
    static async getAll(filters: {
        scope?: IncidentScope;
        type?: string;
        severity?: string;
        activeOnly?: boolean;
        voyageId?: string;
        laneId?: string;
        equipmentId?: string;
        parentId?: string | null;
    }) {
        const where: any = {};

        if (filters.scope) where.scope = filters.scope;
        if (filters.type) where.type = filters.type;
        if (filters.severity) where.severity = filters.severity;
        if (filters.activeOnly) where.endTime = null;
        if (filters.voyageId) where.voyageId = filters.voyageId;
        if (filters.laneId) where.laneId = filters.laneId;
        if (filters.equipmentId) where.equipmentId = filters.equipmentId;
        if (filters.parentId !== undefined) where.parentId = filters.parentId;

        return await prisma.incident.findMany({
            where,
            include: {
                voyage: {
                    include: { vessel: true }
                },
                lane: true,
                equipment: true
            },
            orderBy: { startTime: 'desc' }
        });
    }

    /**
     * Create a new incident.
     */
    static async create(data: {
        scope: IncidentScope;
        type: string;
        severity: string;
        description: string;
        userId: string;
        voyageId?: string;
        laneId?: string;
        equipmentId?: string;
        startTime?: Date;
    }) {
        // Validation: ensure at least the relevant ID is provided for non-GLOBAL scopes
        if (data.scope === 'VOYAGE' && !data.voyageId) throw new Error('Voyage ID is required for VOYAGE scope');
        if (data.scope === 'LANE' && !data.laneId) throw new Error('Lane ID is required for LANE scope');
        if (data.scope === 'EQUIPMENT' && !data.equipmentId) throw new Error('Equipment ID is required for EQUIPMENT scope');

        // PREVENT creating incidents for COMPLETED voyages
        if (data.voyageId) {
            const voyage = await prisma.voyage.findUnique({
                where: { id: data.voyageId },
                select: { status: true }
            });
            if (voyage?.status === 'HOAN_THANH') {
                throw new Error('Cannot create incident for a completed voyage');
            }
        }

        const incident = await prisma.incident.create({
            data: {
                scope: data.scope,
                type: data.type,
                severity: data.severity,
                description: data.description,
                userId: data.userId,
                voyageId: data.voyageId,
                laneId: data.laneId,
                equipmentId: data.equipmentId,
                startTime: data.startTime || new Date()
            },
            include: {
                voyage: {
                    include: { vessel: true }
                },
                lane: true,
                equipment: true
            }
        });

        // CASCADE: Create child incidents for all affected active voyages
        let affectedVoyageIds: string[] = [];
        if (data.voyageId) affectedVoyageIds.push(data.voyageId);

        if (data.scope !== 'VOYAGE') {
            const voyageWhere: any = {
                status: { notIn: ['HOAN_THANH', 'HUY_BO'] }
            };
            if (data.scope === 'LANE') voyageWhere.laneId = data.laneId;
            if (data.scope === 'EQUIPMENT') {
                const equipment = await prisma.equipment.findUnique({
                    where: { id: data.equipmentId },
                    select: { laneId: true }
                });
                if (equipment?.laneId) {
                    voyageWhere.OR = [
                        { equipmentId: data.equipmentId },
                        { laneId: equipment.laneId }
                    ];
                } else {
                    voyageWhere.equipmentId = data.equipmentId;
                }
            }

            const activeVoyages = await prisma.voyage.findMany({
                where: voyageWhere,
                select: { id: true }
            });

            if (activeVoyages.length > 0) {
                await prisma.incident.createMany({
                    data: activeVoyages.map(v => ({
                        scope: 'VOYAGE',
                        type: data.type,
                        severity: data.severity,
                        description: data.description,
                        userId: data.userId,
                        voyageId: v.id,
                        parentId: incident.id,
                        startTime: incident.startTime
                    }))
                });
                affectedVoyageIds.push(...activeVoyages.map(v => v.id));
            }
        }

        for (const vId of affectedVoyageIds) {
            await VoyageService.recalculateProgressAndEtd(vId).catch(console.error);
        }

        return incident;
    }

    /**
     * Resolve (close) an incident by setting the end time.
     */
    static async resolve(id: string, endTime?: Date) {
        // Check if associated voyage is completed
        const incident = await prisma.incident.findUnique({
            where: { id },
            include: { children: true }
        });

        if (incident?.voyageId) {
            const voyage = await prisma.voyage.findUnique({
                where: { id: incident.voyageId },
                select: { status: true }
            });
            if (voyage?.status === 'HOAN_THANH') {
                throw new Error('Cannot resolve incident for a completed voyage');
            }
        }

        const resolveTime = endTime || new Date();

        const updatedIncident = await prisma.incident.update({
            where: { id },
            data: {
                endTime: resolveTime
            }
        });

        // CASCADE: Resolve all unresolved child incidents
        let affectedVoyageIds: string[] = [];
        if (incident?.voyageId) affectedVoyageIds.push(incident.voyageId);

        if (incident?.children && incident.children.length > 0) {
            await prisma.incident.updateMany({
                where: { parentId: id, endTime: null },
                data: { endTime: resolveTime }
            });
            const childVoyages = incident.children.map(c => c.voyageId).filter(Boolean);
            affectedVoyageIds.push(...(childVoyages as string[]));
        }

        for (const vId of affectedVoyageIds) {
            await VoyageService.recalculateProgressAndEtd(vId).catch(console.error);
        }

        return updatedIncident;
    }

    /**
     * Delete an incident record.
     */
    static async delete(id: string, user?: { id: string; role: string }) {
        const incident = await prisma.incident.findUnique({ where: { id }, include: { children: true } });
        if (!incident) throw new Error('Incident not found');

        // RBAC CHECK: MANAGER can delete any. STAFF only if owner.
        if (user && user.role !== 'MANAGER' && incident.userId !== user.id) {
            throw new Error('Bạn không có quyền xóa sự cố của người khác');
        }

        let affectedVoyageIds: string[] = [];
        if (incident?.voyageId) affectedVoyageIds.push(incident.voyageId);
        if (incident?.children?.length) {
            affectedVoyageIds.push(...incident.children.map(c => c.voyageId).filter(Boolean) as string[]);
        }

        const res = await prisma.incident.delete({
            where: { id }
        });

        for (const vId of affectedVoyageIds) {
            await VoyageService.recalculateProgressAndEtd(vId).catch(console.error);
        }

        return res;
    }

    /**
     * Get incidents affecting a specific voyage.
     * Includes Global incidents, Lane incidents (if voyage has a lane), 
     * and Voyage-specific incidents.
     */
    static async getActiveIncidentsForVoyage(voyageId: string, activeOnly = true) {
        const voyage = await prisma.voyage.findUnique({
            where: { id: voyageId },
            select: { laneId: true, createdAt: true, eta: true, actualArrival: true, actualDeparture: true }
        });

        if (!voyage) throw new Error('Voyage not found');

        const where: any = {
            OR: [
                { scope: 'GLOBAL' },
                { scope: 'LANE', laneId: voyage.laneId || undefined },
                { scope: 'VOYAGE', voyageId: voyageId }
            ]
        };

        if (activeOnly) {
            where.endTime = null;
        } else {
            // Filter historically overlapping incidents for the voyage
            const startTimeStr = voyage.actualArrival || voyage.eta || voyage.createdAt;
            const voyageStart = startTimeStr ? new Date(startTimeStr) : new Date();
            const voyageEnd = voyage.actualDeparture ? new Date(voyage.actualDeparture) : null;

            if (voyageEnd) {
                where.AND = [
                    { startTime: { lte: voyageEnd } },
                    {
                        OR: [
                            { endTime: null },
                            { endTime: { gte: voyageStart } }
                        ]
                    }
                ];
            } else {
                where.AND = [
                    {
                        OR: [
                            { endTime: null },
                            { endTime: { gte: voyageStart } }
                        ]
                    }
                ];
            }
        }

        const incidents = await prisma.incident.findMany({
            where,
            include: {
                lane: true,
                equipment: true
            },
            orderBy: { startTime: 'desc' }
        });

        // Deduplicate: If a returned incident is a child, and its Master (parent) is ALSO in this list
        // (e.g., GLOBAL or LANE incident), we filter out the child to avoid double displaying.
        // For EQUIPMENT incidents, the Master is not in this list, so the child will correctly be kept.
        const incidentIds = new Set(incidents.map(i => i.id));
        return incidents.filter(i => {
            if (i.parentId && incidentIds.has(i.parentId)) {
                return false; // Filter out the redundant child
            }
            return true;
        });
    }
}
