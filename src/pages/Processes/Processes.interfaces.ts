import { ProcessResponse } from 'API/REST.interfaces';

export interface ProcessesTableProps {
    processes: ProcessesExtended[];
}

export interface ProcessesBytesChartProps {
    bytes: { x: string; y: number }[];
    labels?: { name: string }[];
    themeColor?: string;
}

export interface ProcessNameLinkCellProps {
    data: ProcessResponse;
    value: ProcessResponse[keyof ProcessResponse];
}

export interface CurrentBytesInfoProps {
    description?: string;
    direction?: 'down' | 'up';
    byteRate: number;
    bytes: number;
    style?: Record<string, string>;
}

export interface ProcessesExtended extends ProcessResponse {
    siteIdentity: string;
    siteName: String;
}

export interface SiteNameLinkCellProps {
    data: ProcessesExtended;
    value: ProcessesExtended[keyof ProcessesExtended];
}
