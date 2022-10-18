import { FlowAggregatesResponse } from 'API/REST.interfaces';

export interface TopologyDetailsProps {
    name: string;
    link: string;
    tcpConnectionsOutEntries: FlowAggregatesResponse[];
    tcpConnectionsInEntries: FlowAggregatesResponse[];
}

export interface TrafficProps {
    data: {
        identity: string;
        targetIdentity: string;
        name: string;
        value: number;
        show: boolean;
    }[];
    link?: string;
    onSelected?: Function;
}
