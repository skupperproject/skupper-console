import { FlowAggregatesResponse } from 'API/REST.interfaces';

export interface TopologyDetailsProps {
    name: string;
    link: string;
    tcpConnectionsOutEntries: FlowAggregatesResponse[];
    tcpConnectionsInEntries: FlowAggregatesResponse[];
}

export interface TrafficProps {
    data: { identity: string; name: string; value: number }[];
    link?: string;
    onSelected?: Function;
}
