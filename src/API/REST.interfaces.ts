import { AxiosRequestConfig } from 'axios';

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

export interface ServiceRequestReceivedResponse {
    site_id: string;
    by_client: Record<string, ServiceConnection>;
}

interface ServiceRequestHandledResponse {
    site_id: string;
    by_server: ServiceDetails;
    by_originating_site: ServiceDetails;
}

export interface DataServicesResponse {
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

export interface DataSiteResponse {
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

export interface DeploymentTopologyResponse {
    key: string;
    service: DataServicesResponse;
    site: DataSiteResponse;
}

export interface DataAdapterResponse {
    sites: DataSiteResponse[];
    services: DataServicesResponse[];
    deployments: DeploymentTopologyResponse[];
    deploymentLinks: DeploymentLinksResponse[];
}

// SITES
export interface SiteResponse {
    siteId: string;
    siteName: string;
    version: string;
    url: string;
    connected: string[];
    namespace: string;
    gateway?: boolean;
}

// SERVICES
export interface ServiceResponse {
    id: string;
    name: string;
    protocol: string;
}

// FLOWS
export interface FlowsRouterResponse {
    identity: string;
    parent: string;
    recType: string;
    name: string;
    hostname: string;
    namespace: string;
    imageName: string;
    imageVersion: string;
    buildVersion: string;
    startTime: number;
}

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
    parent: string;
    startTime: number;
    endTime?: number;
    destHost: string;
    protocol: string;
    destPort: number;
    vanAddress: string;
    name: string;
    rtype: string;
    id: string;
}

export interface FlowResponse {
    parent: string;
    startTime: number;
    endTime?: number;
    octets: number;
    sourceHost: string;
    sourcePort: string;
    counterflow?: string;
    trace?: string;
    latency: number;
    rtype: string;
    id: string;
}

export type FlowsConnectionResponse = FlowsDeviceResponse | FlowResponse;
export type FlowsDataResponse = FlowsRouterResponse &
    FlowsLinkResponse &
    FlowsDeviceResponse &
    FlowResponse;

interface FlowAdapterResponse {
    sourceHost: string;
    sourcePort: string;
    id: string;
    octets: number;
    latency: number;
    counterflow?: string | null;
    connectedTo?: FlowAdapterResponse & { parent: string };
    startTime: number;
    endTime?: number;
    parent: string;
    rtype: string;
    trace?: string;
}

export interface FlowsResponse {
    hostname: string;
    siteName: string;
    name: string;
    rtype: string;
    protocol: string;
    destHost: string;
    destPort: number;
    vanAddress: string;
    id: string;
    flows: FlowAdapterResponse[];
    parent: string;
    startTime: number;
    endTime?: number;
}

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

export interface LinkStatsResponse {
    direction: string;
    id: string;
    linkCost: number;
    mode: string;
    name: string;
    parent: string;
    rtype: string;
    startTime: number;
    endTime?: number;
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
