import { AxiosError, AxiosRequestConfig } from 'axios';

export interface DataResponse {
    sites: DataSiteResponse[];
    services: DataServicesResponse[];
}

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

interface ServiceDetails {
    [key: string]: {
        [key: string]: ServiceConnection;
    };
}

interface ServiceRequestReceivedResponse {
    site_id: string;
    by_client: Record<string, ServiceConnection>;
}

interface ServiceRequestHandledResponse {
    site_id: string;
    by_server: ServiceDetails;
    by_originating_site: ServiceDetails;
}

interface DataServicesResponse {
    address: string;
    protocol: string;
    targets: [
        {
            name: string;
            target: string;
            site_id: string;
        },
    ];
    connections_ingress?: {
        site_id: string;
        connections: Record<string, ServiceConnection>;
    }[];
    connections_egress?: {
        site_id: string;
        connections: Record<string, ServiceConnection>;
    }[];
    requests_handled?: ServiceRequestHandledResponse[];
    requests_received?: ServiceRequestReceivedResponse[];
    derived?: boolean;
    isExternal?: boolean;
}

interface DataSiteResponse {
    site_name: string;
    site_id: string;
    version: string;
    connected: string[];
    namespace: string;
    url: string;
    gateway: boolean;
}

interface DeploymentLinksStreamPoints {
    key: string;
    site: { site_id: string; site_name: string };
}

export interface DeploymentLinksResponse {
    key: string;
    request: ServiceConnection;
    source: DeploymentLinksStreamPoints;
    target: DeploymentLinksStreamPoints;
}

export interface DeploymentLinkTopology {
    key: string;
    source: string;
    target: string;
}

export interface DeploymentTopologyResponse {
    key: string;
    service: DataServicesResponse;
    site: DataSiteResponse;
}

export interface SiteDataResponse {
    siteId: string;
    siteName: string;
    url: string;
    connected: string[];
    namespace: string;
    gateway?: boolean;
}

export interface SiteResponse {
    identity: string;
    recType: string;
    name: string;
    nameSpace: string;
    startTime: number;
}

export interface ServiceResponse {
    id: string;
    name: string;
    protocol: string;
}

export interface LinkResponse {
    identity: string;
    parent: string;
    recType: string;
    name: string;
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

export interface ProcessResponse {
    identity: string;
    parent: string;
    recType: string;
    name: string;
    imageName: string;
    sourceHost: string;
    startTime: number;
    endTime: number;
}

export interface HostResponse {
    identity: string;
    parent: string;
    recType: string;
    name: string;
    startTime: number;
}

// FLOWS
export interface FlowsLinkResponse {
    identity: string;
    parent: string;
    recType: string;
    name: string;
    mode: string;
    linkCost: number;
    direction: string;
    startTime: number;
}

export interface FlowsDeviceResponse {
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
    targetFlow?: any;
}

export interface FlowPairResponse {
    identity: string;
    recType: string;
    sourceSiteId: string;
    destinationSiteId: string;
    forwardFlow: FlowResponse;
    CounterFlow: FlowResponse;
}

export type FlowsDataResponse = RouterResponse &
    FlowsLinkResponse &
    FlowsDeviceResponse &
    FlowResponse;

export interface FlowsVanAddressesResponse {
    identity: string;
    recType: string;
    name: string;
    listenerCount: number;
    connectorCount: number;
    totalFlows: number;
    currentFlows: number;
    startTime: number;
}

export interface FlowsTopologyLink {
    source: string;
    target: string;
    mode: string;
    cost: number;
}

export interface FlowsTopologyResponse {
    nodes: FlowsDataResponse[];
    links: FlowsTopologyLink[];
}

export interface HTTPError extends AxiosError {
    httpStatus?: string;
}

export interface FlowAggregatesMapResponse {
    identity: string;
    rectType: 'FLOWAGGREGATE';
    pairType: 'PROCESS' | 'SITE';
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
