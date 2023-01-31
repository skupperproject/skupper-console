import { ReactNode } from 'react';

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { FlowAggregatesResponse } from 'API/REST.interfaces';

export interface TopologyDetailsProps {
    identity: string;
    name: string;
    link: string;
    tcpConnectionsOutEntries: FlowAggregatesResponse[];
    tcpConnectionsInEntries: FlowAggregatesResponse[];
}

export interface TopologyPanelProps {
    nodes: GraphNode[];
    links: GraphEdge[];
    options?: { showGroup?: boolean; shouldOpenDetails?: boolean };
    onGetSelectedNode?: Function;
    children: ReactNode;
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
