import { Transition } from 'd3-transition';

export interface MonitoringTopologyLink {
    source: string;
    target: string;
    type?: string;
    pType?: string;
    bytes?: string;
    protocol?: string;
    mode?: string;
    cost?: number;
}

export interface MonitoringTopologyLinkNormalized {
    type?: string;
    pType?: string;
    bytes?: string;
    protocol?: string;
    mode?: string;
    cost?: number;
    source: MonitoringTopologyNode | string;
    target: MonitoringTopologyNode | string;
}

export interface MonitoringTopologyRouterNode {
    identity: string;
    name: string;
    x: number;
    y: number;
    fx?: number | null;
    fy?: number | null;
    width: number;
    type: string;
}

export interface MonitoringTopologyDeviceNode {
    identity: string;
    name: string;
    x: number;
    y: number;
    fx?: number | null;
    fy?: number | null;
    type: string;
    recType: string;
    protocol: string;
    avgLatency: number;
    numFlows: number;
}

export type MonitoringTopologyNode = MonitoringTopologyRouterNode | MonitoringTopologyDeviceNode;

export type MonitoringTopologyVanService = SVGSVGElement & {
    zoomIn: () => Transition<SVGSVGElement, unknown, null, undefined>;
    zoomOut: () => Transition<SVGSVGElement, unknown, null, undefined>;
    reset: () => void;
};
