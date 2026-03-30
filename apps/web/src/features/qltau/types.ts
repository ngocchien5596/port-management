export interface Vessel {
    id: string;
    code: string;
    customerName: string;
    capacity: number | null;
    customerPhone: string | null;
    imoCode?: string | null;
    vesselType?: string | null;
    name?: string | null;
    createdAt: string;
    updatedAt: string;
}


export interface Product {
    id: string;
    code: string;
    name: string;
    unit: string;
    type: string;
    createdAt: string;
    updatedAt: string;
}

export interface AddVoyageProgressRequest {
    amount: number;
    hours?: number;
    startTime?: string;
    endTime?: string;
    userId?: string;
    notes?: string;
    shiftCode?: string;
}

export interface UpdateVoyageProgressRequest {
    amount?: number;
    hours?: number;
    startTime?: string;
    endTime?: string;
    notes?: string;
    shiftCode?: string;
    laneId?: string | null;
    equipmentId?: string | null;
    productId?: string;
    type?: string;
    status?: string;
    priority?: string;
    queueNo?: number;
    isYielded?: boolean;
    eta?: string | null;
    etd?: string | null;
    totalVolume?: number | null;
    actualArrival?: string | null;
    actualDeparture?: string | null;
    theoreticalEtd?: string | null;
    theoreticalProgress?: number;
    equipmentCapacity?: number;
}

export interface Voyage {
    id: string;
    voyageCode: number;
    vesselId: string;
    laneId?: string | null;
    equipmentId?: string | null;
    productId: string;
    type: string;
    status: string;
    priority: string;
    queueNo: number;
    isYielded: boolean;
    eta?: string | null;
    etd?: string | null;
    totalVolume?: number | null;
    actualArrival?: string | null;
    actualDeparture?: string | null;
    theoreticalEtd?: string | null;
    procedureTimeHours?: number | null;
    theoreticalProgress?: number;
    equipmentCapacity?: number;
    performanceTrendData?: Array<{
        timestamp: string;
        actualCumulative: number;
        theoreticalCumulative: number;
        label: string;
    }>;
    vessel?: Vessel;
    product?: Product;
    equipment?: any;
    progress?: VoyageProgress[];
    events?: VoyageEvent[];
    lane?: Lane;
    netProductivity?: number;
    equipmentEfficiency?: number;
    createdAt: string;
    updatedAt: string;
}

export interface VoyageProgress {
    id: string;
    voyageId: string;
    amount: number;
    hours?: number;
    startTime?: string;
    endTime?: string;
    productivity?: number;
    cumulative: number;
    notes?: string;
    shiftCode?: string;
    userId: string;
    employee?: {
        fullName: string;
    };
    updatedBy?: {
        fullName: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface VoyageEvent {
    id: string;
    voyageId: string;
    type: string;
    title: string;
    description?: string;
    metadata?: any;
    userId?: string;
    employee?: {
        fullName: string;
    };
    createdAt: string;
}
export interface Lane {
    id: string;
    name: string;
    equipments?: any[];
    voyages?: Voyage[];
    createdAt: string;
    updatedAt: string;
}

export interface LaneSuggestion {
    id: string;
    name: string;
    isFree: boolean;
    activeCount: number;
    estimatedWaitTime: number;
    queueEndTime: number;
    reason: string;
}
