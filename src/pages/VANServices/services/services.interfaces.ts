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

// FLOW PAIRS TABLE
export interface FlowPairsTableProps {
    flowPairs: FlowPairBasic[];
}

// Process TABLE
export interface ProcessRow {
    id: string;
    siteName: string;
    processName: string;
    bytes: number;
    byteRate: number;
    host: string;
    port: string;
    imageName: string;
    maxTTFB: number;
}

export interface ProcessesTableProps {
    processes: ProcessRow[];
}
// FLOWPAIR BASIC INFO
export interface FlowPairBasic {
    id: string;
    siteName: string;
    byteRate: number;
    bytes: number;
    host: string;
    port: string;
    processId: string;
    processName: string;
    processImageName: string;
    latency: number;
    startTime: number;
    endTime?: number;
    targetSiteName: string;
    targetByteRate: number;
    targetBytes: number;
    targetHost: string;
    targetPort: string;
    targetProcessId: string;
    targetProcessName: string;
    targetProcessImageName: string;
    targetLatency: number;
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
