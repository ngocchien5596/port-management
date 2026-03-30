import { Product } from '../qltau/types';

export type CargoCategory = 'IMPORT' | 'EXPORT';


export interface Lane {
    id: string;
    name: string;
    equipments?: Equipment[];
    createdAt: string;
    updatedAt: string;
}

export interface Equipment {
    id: string;
    name: string;
    laneId: string;
    lane?: Lane;
    products?: Product[];
    capacity?: number;
    status: string;        // BUSY, IDLE, MAINTENANCE, etc.
    manualStatus?: string; // MAINTENANCE, REPAIR, null (AUTO)
    createdAt: string;
    updatedAt: string;
}

export interface EquipmentEvent {
    id: string;
    equipmentId: string;
    type: string;
    title: string;
    description?: string;
    metadata?: any;
    userId?: string;
    employee?: {
        fullName: string;
        employeeCode: string;
    };
    createdAt: string;
}


export interface CreateLaneRequest {
    name: string;
}

export interface CreateEquipmentRequest {
    name: string;
    laneId: string;
    capacity?: number;
    productIds: string[];
}
