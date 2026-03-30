export type IncidentScope = 'GLOBAL' | 'LANE' | 'EQUIPMENT' | 'VOYAGE';

export interface Incident {
    id: string;
    scope: IncidentScope;
    voyageId?: string | null;
    laneId?: string | null;
    equipmentId?: string | null;
    type: string;
    severity: string;
    description: string;
    startTime: string;
    endTime?: string | null;
    userId: string;
    voyage?: {
        id: string;
        vessel: {
            name?: string | null;
            code: string;
        }
    } | null;
    lane?: {
        id: string;
        name: string;
    } | null;
    equipment?: {
        id: string;
        name: string;
    } | null;
    createdAt: string;
}

export interface CreateIncidentData {
    scope: IncidentScope;
    type: string;
    severity: string;
    description: string;
    userId: string;
    voyageId?: string;
    laneId?: string;
    equipmentId?: string;
    startTime?: string;
}
