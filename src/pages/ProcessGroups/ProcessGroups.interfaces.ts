import { ProcessResponse, ProcessGroupResponse } from 'API/REST.interfaces';

export interface ProcessGroupsTableProps {
    processGroups: ProcessGroupResponse[];
}

export interface ProcessGroupsMetricsProps {
    services: ProcessGroupResponse[];
}

export interface ProcessesTableProps {
    processes: ProcessResponse[];
}

export interface ProcessGroupsBytesChartProps {
    bytes: { x: string; y: number }[];
    labels?: { name: string }[];
    themeColor?: string;
}
