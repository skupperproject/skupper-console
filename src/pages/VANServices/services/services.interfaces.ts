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

export interface FlowPairBasic {
    id: string;
    siteName: string;
    byteRate: number;
    bytes: number;
    host: string;
    port: string;
    processName: string;
    startTime: number;
    endTime?: number;
    targetSiteName: string;
    targetByteRate: number;
    targetBytes: number;
    targetHost: string;
    targetPort: string;
    targetProcessName: string;
    protocol: string;
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
    endFlow: extendedFlow;
}
