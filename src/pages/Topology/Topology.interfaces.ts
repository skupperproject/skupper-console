import { FlowAggregatesResponse } from 'API/REST.interfaces';

export interface TopologyDetailsProps {
    name: string;
    link: string;
    tcpConnectionsOutEntries: FlowAggregatesResponse[];
    tcpConnectionsInEntries: FlowAggregatesResponse[];
}

export interface TrafficData {
    identity: string;
    targetIdentity: string;
    name: string;
    value: number;
    show: boolean;
}
export interface TrafficProps {
    data: TrafficData[];
    link?: string;
    onSelected?: Function;
}
