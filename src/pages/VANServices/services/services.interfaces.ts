import {
    FlowsVanAddressesResponse,
    FlowsTopologyResponse,
    FlowsDeviceResponse,
    FlowResponse,
    FlowsRouterResponse,
    FlowsSiteResponse,
    FlowsProcessResponse,
} from 'API/REST.interfaces';

export type Flow = FlowResponse;

interface Device extends FlowsDeviceResponse {
    routerName: string;
    namespace: string;
}

export type FlowPair = {
    devices: Device[];
    flows: FlowResponse[];
};

export type MonitoringTopology = FlowsTopologyResponse;
export type VanAddresses = FlowsVanAddressesResponse;

// FLOWPAIR BASIC INFO
export interface ConnectionBasic extends Flow {
    siteName: string;
    processName: string;
    targetSiteName?: string;
    targetProcessName?: string;
}
export interface ConnectionsBasic {
    connections: ConnectionBasic[];
    total: number;
}

// FLOWPAIR
interface extendedFlow extends Flow {
    site: FlowsSiteResponse;
    processFlow: FlowsProcessResponse;
    router: FlowsRouterResponse;
    device: FlowsDeviceResponse;
    parentType?: string;
}

export interface ExtendedConnectionFlows {
    startFlow: extendedFlow;
    endFlow: extendedFlow | null;
}
