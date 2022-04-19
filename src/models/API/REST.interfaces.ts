import { AxiosRequestConfig } from 'axios';

export type FetchWithTimeoutOptions = AxiosRequestConfig;

export interface ServiceConnections {
    id: string;
    client: string;
    start_time: number;
    last_out: number;
    last_in: number;
    bytes_in: number;
    bytes_out: number;
}

interface ServiceDetails {
    [key: string]: {
        [key: string]: {
            request: number;
            bytes_in: number;
            bytes_out: number;
            latency_max: number;
            details: {
                'POST:200': number;
            };
        };
    };
}

interface ServiceRequest {
    site_id: string;
    [key: symbol]: ServiceDetails;
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
    connections_ingress:
        | {
              site_id: string;
              connections: ServiceConnections;
          }[]
        | null;
    connections_egress:
        | {
              site_id: string;
              connections: ServiceConnections;
          }[]
        | null;
    requests_handled: ServiceRequest[] | null;
    requests_received: ServiceRequest[] | null;
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
    edge: boolean;
    gateway: boolean;
}

export interface DataResponse {
    sites: DataSiteResponse[];
    services: DataServicesResponse[];
}

export interface LinkResponse {
    name: string;
    siteConnected: string;
    connected: boolean;
    configured: boolean;
    created: string;
}

export interface TargetResponse {
    name: string;
    type: string;
    ports: {
        name: string;
        port: number;
    };
}

export interface ServiceSitesResponse {
    name: string;
    protocol: string;
    ports: number[];
    endpoints: [
        {
            name: string;
            target: string;
            ports: {
                [port: string]: number;
            };
        },
    ];
}

// SERVICES
export interface ServiceResponse {
    id: string;
    name: string;
    protocol: string;
}

// DEPLOYMENTS
export interface DeploymentResponse {
    id: string;
    name: string;
    protocol: string;
    numConnectionsIn: number;
    numConnectionsOut: number;
    sites: { name: string; url: string }[];
}

// FLOWSS
interface FlowResponse {
    sourceHost: string;
    sourcePort: string;
    id: string;
    octets: number;
    latency: number;
    counterflow?: string | null;
    connectedTo?: FlowResponse & { parent: string };
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
    deviceNameConnectedTo: string;
    flows: FlowResponse[];
    parent: string;
    startTime: number;
    endTime?: number;
}

export interface ServicesStatsResponse {
    id: string;
    name: string;
    routerName: string;
    totalDevices: number;
    totalFlows: number;
    totalBytes: number;
}

interface LinkStatsResponse {
    direction: string;
    id: string;
    linkCost: number;
    mode: string;
    name: string;
    parent: string;
    rtype: string;
    startTime: number;
}

export interface RouterStatsResponse {
    id: string;
    name: string;
    totalVanAddress: number;
    totalFlows: number;
    totalBytes: number;
    connectedTo: LinkStatsResponse[];
}

export interface MonitoringStatsResponse {
    name: string;
    totalVanAddress: number;
    totalFlows: number;
    totalBytes: number;
    totalRouters: number;
    totalLinks: number;
}

interface MonitoringRoutersTopologyLink {
    source: string;
    target: string;
    mode: string;
    cost: string;
}

export interface MonitoringRoutersTopologyResponse {
    nodes: FlowsResponse[];
    links: MonitoringRoutersTopologyLink[];
}
