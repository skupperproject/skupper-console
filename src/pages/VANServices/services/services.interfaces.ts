import {
    FlowsVanAddressesResponse,
    FlowsTopologyResponse,
    FlowsDeviceResponse,
    FlowResponse,
    FlowsSiteResponse,
    FlowsProcessResponse,
} from 'API/REST.interfaces';

export type VanServicesTopology = FlowsTopologyResponse;
export type VanAddresses = FlowsVanAddressesResponse;

// FLOWPAIR BASIC INFO
export interface FlowPairBasic extends FlowResponse {
    siteName: string;
    processName: string;
    targetSiteName?: string;
    targetProcessName?: string;
}
export interface FlowsPairsBasic {
    connections: FlowPairBasic[];
    total: number;
}

// FLOWPAIR
interface extendedFlow extends FlowResponse {
    site: FlowsSiteResponse;
    processFlow: FlowsProcessResponse;
    device: FlowsDeviceResponse;
    parentType?: string;
}

export interface ExtendedFlowPair {
    startFlow: extendedFlow;
    endFlow: extendedFlow | null;
}
