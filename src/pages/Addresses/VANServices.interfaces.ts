import { Transition } from 'd3-transition';

import { ExtendedFlowPair, VanServicesTopology } from './services/services.interfaces';

// FLOWPAIR DETAILS

export interface FlowPairDetailsProps {
    connection: ExtendedFlowPair;
}

export interface FlowPairProps {
    connection: ExtendedFlowPair;
    routers: VanServicesTopology;
}

export interface VanServicesTopologyLink {
    source: string;
    target: string;
    type?: string;
    pType?: string;
    bytes?: string;
    protocol?: string;
    mode?: string;
    cost?: number;
}

export interface VanServicesTopologyLinkNormalized {
    type?: string;
    pType?: string;
    bytes?: string;
    protocol?: string;
    mode?: string;
    cost?: number;
    source: VanServicesTopologyNode | string;
    target: VanServicesTopologyNode | string;
}

export interface VanServicesTopologyRouterNode {
    identity: string;
    name: '';
    x: number;
    y: number;
    fx?: number | null;
    fy?: number | null;
    width: number;
    type: string;
}

export interface VanServicesTopologyDeviceNode {
    identity: string;
    name: string;
    x: number;
    y: number;
    fx?: number | null;
    fy?: number | null;
    type: string;
    recType: string;
    protocol: string;
    sourceHost: string;
    sourcePort: string;
    bytes: string;
}

export type VanServicesTopologyNode = VanServicesTopologyRouterNode | VanServicesTopologyDeviceNode;

export type VanServicesTopologyVanService = SVGSVGElement & {
    zoomIn: () => Transition<SVGSVGElement, unknown, null, undefined>;
    zoomOut: () => Transition<SVGSVGElement, unknown, null, undefined>;
    reset: () => void;
};
