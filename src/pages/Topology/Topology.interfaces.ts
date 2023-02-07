import { ReactNode } from 'react';

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';

import { ProcessConnectedDetail } from './services/services.interfaces';

export interface TopologyDetailsProps {
    identity: string;
    name: string;
    link: string;
    tcpConnectionsOutEntries: ProcessConnectedDetail[];
    tcpConnectionsInEntries: ProcessConnectedDetail[];
}

export interface TopologyPanelProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
    nodeSelected?: string | null;
    options?: { showGroup?: boolean; shouldOpenDetails?: boolean };
    onGetSelectedNode?: Function;
    onGetSelectedEdge?: Function;
    children?: ReactNode;
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
