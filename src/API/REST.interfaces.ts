import { AxiosError, AxiosRequestConfig } from 'axios';

export type FetchWithTimeoutOptions = AxiosRequestConfig;

export interface ServiceConnection {
    id: string;
    client: string;
    start_time: number;
    last_out: number;
    last_in: number;
    bytes_in: number;
    bytes_out: number;
    latency_max: number;
    details?: Record<string, string>;
    requests?: number;
}
export interface DeploymentLinkTopology {
    key: string;
    source: string;
    target: string;
}

export interface SiteResponse {
    identity: string;
    recType: string;
    name: string;
    nameSpace: string;
    startTime: number;
}

export interface ProcessGroupResponse {
    identity: string;
    recType: string;
    name: string;
    octetsSent: number;
    octetSentRate: number;
    octetsReceived: number;
    octetReceivedRate: number;
    startTime: number;
}

export interface LinkResponse {
    identity: string;
    parent: string;
    recType: string;
    name: string;
    mode: string;
    direction: 'outgoing' | 'incoming';
    linkCost: number;
    startTime: number;
}

export interface RouterResponse {
    identity: string;
    parent: string;
    recType: string;
    name: string;
    namespace: string;
    hostname: string;
    imageName: string;
    imageVersion: string;
    buildVersion: string;
    startTime: number;
}

// Connector and Listener
export interface DeviceResponse {
    identity: string;
    parent: string;
    recType: string;
    address: string;
    protocol: string;
    destHost: string;
    destPort: string;
    flowRateL4: number;
    flowCountL4: number;
    startTime: number;
}
export interface ProcessResponse {
    identity: string;
    parent: string;
    groupIdentity: string;
    recType: string;
    name: string;
    imageName: string;
    sourceHost: string;
    hostName: string;
    octetsSent: number;
    octetSentRate: number;
    octetsReceived: number;
    octetReceivedRate: number;
    startTime: number;
    endTime: number;
}

export interface HostResponse {
    identity: string;
    parent: string;
    recType: string;
    name: string;
    provider: string;
    startTime: number;
}

// FLOWS

export interface FlowResponse {
    identity: string;
    parent: string;
    recType: string;
    octets: number;
    octetRate: number;
    octetsUnacked: number;
    windowSize: number;
    sourceHost: string;
    sourcePort: string;
    latency: number;
    process: string;
    trace?: string;
    counterFlow?: string;
    startTime: number;
    endTime?: number;
}

export interface FlowPairResponse {
    identity: string;
    recType: string;
    sourceSiteId: string;
    destinationSiteId: string;
    forwardFlow: FlowResponse;
    counterFlow: FlowResponse;
}

export interface AddressesResponse {
    identity: string;
    recType: string;
    name: string;
    listenerCount: number;
    connectorCount: number;
    totalFlows: number;
    currentFlows: number;
    startTime: number;
}

export interface HTTPError extends AxiosError {
    httpStatus?: string;
}

export interface FlowAggregatesMapResponse {
    identity: string;
    rectType: 'FLOWAGGREGATE';
    pairType: 'PROCESS' | 'SITE' | 'PROCESS_GROUP';
    sourceId: string;
    destinationId: string;
    startTime: number;
}

export interface FlowAggregatesResponse {
    identity: string;
    rectType: 'FLOWAGGREGATE';
    pairType: 'PROCESS' | 'SITE';
    recordCount: number;
    sourceId: string;
    sourceOctets: number;
    sourceMinLatency: number;
    sourceMaxLatency: number;
    sourceAverageLatency: number;
    destinationId: string;
    destinationOctets: number;
    destinationMinLatency: number;
    destinationAverageLatency: number;
    startTime: number;
}
