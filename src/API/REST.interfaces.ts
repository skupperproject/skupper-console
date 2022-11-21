import { AxiosError, AxiosRequestConfig } from 'axios';

export interface RequestOptions {
    filters?: Record<string, string>;
    offset?: number;
    limit?: number;
    sortDirection?: 'asc' | 'desc';
    sortName?: string;
}

export type FetchWithTimeoutOptions = AxiosRequestConfig;

export interface HTTPError extends AxiosError {
    httpStatus?: string;
}

interface BaseResponse {
    identity: string;
    recType: string;
    startTime: number;
}

interface EntityBaseResponse extends BaseResponse {
    name: string;
}

interface EntityMetricsResponse {
    octetsSent: number;
    octetSentRate: number;
    octetsReceived: number;
    octetReceivedRate: number;
    type: 'skupper' | 'app';
}

export interface SiteResponse extends EntityBaseResponse, EntityMetricsResponse {
    nameSpace: string;
}

export type ProcessGroupResponse = EntityBaseResponse & EntityMetricsResponse;

export interface ProcessResponse extends EntityBaseResponse, EntityMetricsResponse {
    parent: string;
    parentName: string;
    groupIdentity: string;
    groupName: string;
    imageName: string;
    sourceHost: string;
    hostName: string;
    endTime?: number;
}
export interface LinkResponse extends EntityBaseResponse {
    parent: string;
    mode: string;
    direction: 'outgoing' | 'incoming';
    linkCost: number;
}

export interface RouterResponse extends EntityBaseResponse {
    parent: string;
    namespace: string;
    hostname: string;
    imageName: string;
    imageVersion: string;
    buildVersion: string;
}

export interface DeviceResponse extends EntityBaseResponse {
    parent: string;
    address: string;
    protocol: string;
    destHost: string;
    destPort: string;
    flowRateL4: number;
    flowCountL4: number;
}

export interface HostResponse extends EntityBaseResponse {
    parent: string;
    provider: string;
}

export interface AddressResponse extends EntityBaseResponse {
    listenerCount: number;
    connectorCount: number;
    totalFlows: number;
    currentFlows: number;
}

interface FlowResponse extends BaseResponse {
    parent: string;
    octets: number;
    octetRate: number;
    octetsUnacked: number;
    windowSize: number;
    sourceHost: string;
    sourcePort: string;
    latency: number;
    process: string;
    trace?: string;
    endTime?: number;
}

export interface FlowPairResponse extends BaseResponse {
    sourceSiteId: string;
    destinationSiteId: string;
    forwardFlow: FlowResponse;
    counterFlow: FlowResponse;
    siteAggregateId: string;
    processGroupAggregateId: string;
    processAggregateId: string;
}
export interface FlowAggregatesMapResponse extends BaseResponse {
    rectType: string;
    pairType: string;
    sourceId: string;
    destinationId: string;
}

export interface FlowAggregatesResponse extends BaseResponse {
    rectType: string;
    pairType: string;
    recordCount: number;
    sourceId: string;
    sourceName: string;
    sourceOctets: number;
    sourceOctetRate: number;
    sourceMinLatency: number;
    sourceMaxLatency: number;
    sourceAverageLatency: number;
    destinationId: string;
    destinationName: string;
    destinationOctets: number;
    destinationOctetRate: number;
    destinationMinLatency: number;
    destinationAverageLatency: number;
}
