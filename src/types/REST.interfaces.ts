import { AxiosError, AxiosRequestConfig } from 'axios';

import { AvailableProtocols, Binding, Direction, Role, SortDirection } from '@API/REST.enum';

export type FetchWithOptions = AxiosRequestConfig;
export type FlowDirections = Direction.Outgoing | Direction.Incoming;

export interface RemoteFilterOptions extends Record<string, string | string[] | number | SortDirection | undefined> {
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
  imageName?: string;
  sourceHost: string;
  hostName: string;
  processBinding: Binding;
  processRole: Role;
  addresses?: string[];
}

export interface ProcessPairsResponse extends BaseResponse {
  sourceId: string;
  sourceName: string;
  destinationId: string;
  destinationName: string;
  sourceSiteId: string;
  sourceSiteName: string;
  destinationSiteId: string;
  destinationSiteName: string;
  protocol: AvailableProtocols; // undefined = there is a remote process
}

export type ComponentPairsResponse = ProcessPairsResponse;

export interface SitePairsResponse extends BaseResponse {
  sourceId: string;
  sourceName: string;
  destinationId: string;
  destinationName: string;
  protocol: AvailableProtocols;
}

export interface ServiceResponse extends BaseResponse {
  name: string;
  protocol: AvailableProtocols;
  connectorCount: number;
  listenerCount: number;
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
  protocol: AvailableProtocols;
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

export interface LinkResponse extends BaseResponse {
  name?: string;
  parent: string;
  mode: string;
  direction: FlowDirections;
  linkCost: number;
  sourceSiteId: string;
  destinationSiteId: string;
}
