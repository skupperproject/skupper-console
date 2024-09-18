import { AxiosError, AxiosRequestConfig } from 'axios';

import { Protocols, Binding, Direction, Role, SortDirection } from '@API/REST.enum';

export type FetchWithOptions = AxiosRequestConfig;
export type FlowDirections = Direction.Outgoing | Direction.Incoming;

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

export interface HTTPError extends AxiosError {
  httpStatus?: string;
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
export type ResponseWrapper<T> = {
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
  platform: 'kubernetes' | 'podman' | undefined;
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

export interface SitePairsResponse extends BaseResponse {
  sourceId: string;
  sourceName: string;
  destinationId: string;
  destinationName: string;
  protocol: Protocols;
}

export type ComponentPairsResponse = SitePairsResponse;

export interface ProcessPairsResponse extends ComponentPairsResponse {
  sourceSiteId: string;
  sourceSiteName: string;
  destinationSiteId: string;
  destinationSiteName: string;
}

export interface ServiceResponse extends BaseResponse {
  name: string;
  protocol: Protocols;
  connectorCount: number;
  listenerCount: number;
  isBound: boolean;
}

interface BiFlow extends BaseResponse {
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
  latency: number;
  latencyReverse: number;
  traceRouters: string[];
  traceSites: string[];
  protocol: Protocols;
  connectorError: null;
  connectorId: string;
  listenerId: string;
  listenerError: string | null;
}

export interface TcpBiflow extends BiFlow {
  proxyHost: string; //what the service will see as the client.  ie: 172.17.44.249
  proxyPort: number; //ie: 56956
  destHost: string; //what the service will see as the
  destPort: number;
  sourceHost: string; //ie: '172.17.44.196'
  sourcePort: number; //ie:  47504
}

export interface HttpBiflow extends BiFlow {
  forwardFlow: {
    method?: string;
    result?: number;
    reason?: string;
  };
  counterFlow: {
    method?: string;
    result?: number;
    reason?: string;
  };
}

export type FlowPairsResponse = TcpBiflow | HttpBiflow;

export interface RouterResponse extends BaseResponse {
  name: string;
  parent: string;
  namespace: string;
  hostname: string;
  imageName: string;
  imageVersion: string;
  buildVersion: string;
}

export interface RouterLinkResponse extends BaseResponse {
  cost: number | null;
  destinationSiteId: string | null;
  destinationSiteName: string | null;
  name: string;
  octets: number;
  octetsReverse: number;
  peer: string | null;
  routerId: string;
  sourceSiteId: string;
  sourceSiteName: string;
  role: 'inter-router' | 'edge-router';
  status: 'up' | 'down';
}
