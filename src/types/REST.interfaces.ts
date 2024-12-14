import { TopologyMetrics } from './Topology.interfaces';
import { Protocols, Binding, Role, SortDirection } from '../API/REST.enum';
import { PrometheusLabelsV2 } from '../config/prometheus';

export interface QueryFilters extends Record<string, string | string[] | number | boolean | SortDirection | undefined> {
  filter?: string;
  offset?: number;
  limit?: number;
  sortDirection?: SortDirection;
  sortName?: string;
  timeRangeStart?: number;
  timeRangeEnd?: number;
  timeRangeOperation?: number; // 0: intersect , 1: contains, 2: within
}

export interface QueryParams {
  filter?: string;
  offset?: number;
  limit?: number;
  timeRangeEnd?: number;
  timeRangeStart?: number;
  sortBy?: string | null;
}

/**
 * Represents a response wrapper that contains the results, count, and time range count.
 * The `results` property holds the actual data based on the Response interface.
 * The `count` property represents the total count of the results.
 * The `timeRangeCount` property represents the count of results within the specified time range.
 *
 * @typeParam T - The type of the results based on the Response interface.
 * @returns A ResponseWrapper object containing the results, count, and time range count.
 */
export type ApiResponse<T> = {
  results: T; // Type based on the Response interface
  count: number;
  timeRangeCount: number;
};

/* Response Interfaces */

// Properties that are shared by every response
interface BaseResponse {
  identity: string;
  startTime: number;
  endTime: number;
}

export interface UserResponse {
  username: string;
  authType: 'internal' | 'openshift';
}

export interface SiteResponse extends BaseResponse {
  name: string;
  nameSpace: string;
  siteVersion: string;
  platform: 'kubernetes' | 'podman' | string | undefined;
  routerCount: number;
}

export interface RouterLinkResponse extends BaseResponse {
  cost: number | null;
  routerAccessId: string | null; // When connected, the identity of the destitation (peer) router access
  destinationRouterId: string | null; // When connected, the identity of the destitation (peer) router
  destinationRouterName: string | null;
  destinationSiteId: string | null;
  destinationSiteName: string | null;
  name: string;
  octets: number;
  octetsReverse: number;
  routerId: string;
  routerName: string;
  sourceSiteId: string;
  sourceSiteName: string;
  role: 'inter-router' | 'edge-router';
  status: 'up' | 'down' | 'partially_up';
}

export interface ComponentResponse extends BaseResponse {
  name: string;
  processGroupRole: Role;
  processCount: number;
}

export interface ProcessResponse extends BaseResponse {
  name: string;
  parent: string;
  parentName: string;
  groupIdentity: string;
  groupName: string;
  sourceHost: string;
  processBinding: Binding;
  processRole: Role;
  hostName: string | null;
  imageName: string | null;
  addresses: string[] | null;
}

export interface BasePairs {
  sourceId: string;
  sourceName: string;
  destinationId: string;
  destinationName: string;
}

interface BasePairsResponse extends BaseResponse, BasePairs {
  protocol: Protocols;
  observedApplicationProtocols?: string;
}

export interface ProcessPairsResponse extends BasePairsResponse {
  sourceSiteId: string;
  sourceSiteName: string;
  destinationSiteId: string;
  destinationSiteName: string;
}

export type PairsResponse = BasePairsResponse | ProcessPairsResponse;

export interface ListenerResponse extends BaseResponse {
  name: string;
  parent: string;
  addressId: string;
  address: string;
  destHost: string;
  destPort: number;
  processId: string;
  siteId: string;
  siteName: string;
}

export interface ConnectorResponse extends BaseResponse {
  name: string;
  parent: string;
  addressId: string;
  address: string;
  destHost: string;
  destPort: number;
  processId: string;
  target: string; //process name associated,
  count?: number;
  siteName: string;
  siteId: string;
  processes?: ConnectorResponse[];
}
export interface ServiceResponse extends BaseResponse {
  name: string;
  protocol: Protocols;
  observedApplicationProtocols: string[];
  connectorCount: number;
  listenerCount: number;
  isBound: boolean;
  hasListener: boolean;
}

interface BaseFlow extends BaseResponse {
  identity: string;
  sourceProcessId: string;
  sourceProcessName: string;
  sourceSiteId: string;
  sourceSiteName: string;
  destSiteId: string;
  destSiteName: string;
  destProcessId: string;
  destProcessName: string;
  routingKey: string;
  duration: number | null;
  octets: number;
  octetsReverse: number;
  traceRouters: string[];
  traceSites: string[];
  protocol: Protocols;
}

export interface TransportFlowResponse extends BaseFlow {
  latency: number;
  latencyReverse: number;
  proxyHost: string; //what the service will see as the client.  ie: 172.17.44.249
  proxyPort: string; //ie: 56956
  destHost: string; //what the service will see as the
  destPort: string;
  sourceHost: string; //ie: '172.17.44.196'
  sourcePort: string; //ie:  47504
  connectorError: null;
  connectorId: string;
  listenerId: string;
  listenerError: string | null;
}

export interface ApplicationFlowResponse extends BaseFlow {
  connectionId: string;
  method?: string;
  status?: string;
}

export type BiFlowResponse = TransportFlowResponse | ApplicationFlowResponse;

export interface PairsWithMetrics<T> {
  processesPairs: T[];
  prometheusKey: PrometheusLabelsV2;
  processPairsKey: 'sourceName' | 'destinationName';
  metrics?: TopologyMetrics;
}

export type PairsWithInstantMetrics = PairsResponse & {
  bytes: number;
  byteRate: number;
  latency: number;
};
