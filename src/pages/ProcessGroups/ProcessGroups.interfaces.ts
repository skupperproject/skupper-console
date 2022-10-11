import { ProcessResponse, ProcessGroupResponse } from 'API/REST.interfaces';

export interface ProcessGroupsTableProps {
    processGroups: ProcessGroupResponse[];
}

export interface ProcessGroupsBytesChartProps {
    bytes: { x: string; y: number }[];
    labels?: { name: string }[];
    themeColor?: string;
}

export interface ProcessGroupNameLinkCellProps {
    data: ProcessResponse;
    value: ProcessResponse[keyof ProcessResponse];
}
