export interface OperationalStats {
    totalVoyages: number;
    totalThroughput: number;
    avgProductivity: number;
    completionRate: number;
}

export interface SafetyStats {
    totalIncidents: number;
    totalDowntimeMinutes: number;
    mttrMinutes: number;
    incidentBreakdown: {
        RED: number;
        YELLOW: number;
        GREEN: number;
    };
}

export interface EquipmentUtilization {
    id: string;
    name: string;
    laneName: string;
    downtimeMinutes: number;
    utilizationRate: number;
}

export interface AggregatedStats {
    operational: OperationalStats;
    safety: SafetyStats;
}

export interface VolumeReportItem {
    id: string;
    voyageId: string;
    vesselCode: string;
    vesselName: string;
    productCode: string;
    productName: string;
    amount: number;
    hours: number;
    startTime: string;
    endTime: string;
    shiftCode: string;
}

export interface ProductivityReportItem {
    id: string;
    voyageId: string;
    vesselCode: string;
    equipmentName: string;
    endTime: string;
    shiftCode: string;
    amount: number;
    hours: number;
    actualProductivity: number;
    ratedCapacity: number;
}
