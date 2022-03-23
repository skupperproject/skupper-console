export type SiteData = {
  site_name: string;
  site_id: string;
  version: string;
  connected: string[];
  namespace: string;
  url: string;
  edge: boolean;
};

interface ServiceConnections {
  [key: string]: {
    id: string;
    client: string;
    start_time: number;
    last_out: number;
    last_in: number;
    bytes_in: number;
    bytes_out: number;
  };
}

interface pp {
  request: number;
  bytes_in: number;
  bytes_out: number;
  latency_max: number;
  details: {
    'POST:200': number;
  };
}

interface ServiceRequest {
  site_id: string;
  [key: symbol]: pp;
}

export interface ServiceData {
  address: string;
  protocol: string;
  targets: { name: string; target: string; site_id: string }[] | null;
  connections_ingress: {
    site_id: string;
    connections: ServiceConnections[];
  }[];
  connections_egress: {
    site_id: string;
    connections: ServiceConnections[];
  }[];
  requests_handled: ServiceRequest[];
  requests_received: ServiceRequest[];
}

export interface OverviewService {
  address: string;
  protocol: string;
  siteName: string;
  siteId: string;
}

export type OverviewSite = SiteData;

export interface OverviewData {
  site: { id: string; name: string };
  sites: OverviewSite[];
  services: OverviewService[];
}
