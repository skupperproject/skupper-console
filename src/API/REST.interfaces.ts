import { AxiosError, AxiosRequestConfig } from 'axios';

import { AvailableProtocols, Binding, Direction, Role, SortDirection } from './REST.enum';

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
  status: string; // this field is for debug scope. Empty value => OK. In case we have some internal BE error that is not a http status this field is not empty. For example a value can be `Malformed sortBy query`
  count: number;
  timeRangeCount: number;
  totalCount: number;
};

/* Response Interfaces */

// Properties that are shared by every response
interface BaseResponse {
  identity: string;
  recType: string;
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
  pairType: string;
  sourceId: string;
  sourceName: string;
  destinationId: string;
  destinationName: string;
  sourceSiteId: string;
  sourceSiteName: string;
  destinationSiteId: string;
  destinationSiteName: string;
  protocol?: AvailableProtocols; // undefined = there is a remote process
}

export type ComponentPairsResponse = ProcessPairsResponse;

export interface SitePairsResponse extends BaseResponse {
  pairType: string;
  sourceId: string;
  sourceName: string;
  destinationId: string;
  destinationName: string;
  protocol?: AvailableProtocols;
}

export interface ServiceResponse extends BaseResponse {
  name: string;
  protocol: AvailableProtocols;
  connectorCount: number;
  listenerCount: number;
}

export interface FlowPairsResponse<T = RequestHTTP & ConnectionTCP> extends BaseResponse {
  sourceSiteId: string;
  sourceSiteName: string;
  destinationSiteId: string;
  destinationSiteName: string;
  protocol: string;
  forwardFlow: T;
  counterFlow: T;
  flowTrace: string;
  siteAggregateId: string;
  processGroupAggregateId: string;
  processAggregateId: string;
  duration: number;
}

export interface ConnectionTCP extends BaseResponse {
  parent: string;
  counterFlow: string;
  octets: number;
  octetsUnacked: number;
  windowSize: number;
  sourceHost: string;
  sourcePort: string;
  latency: number;
  process: string;
  processName: string;
}

export interface RequestHTTP extends BaseResponse {
  counterFlow: string;
  parent: string;
  octets: number;
  method?: string;
  latency: number;
  process: string;
  processName: string;
  streamIdentity?: number;
  result?: number;
  reason?: string;
  place: 1 | 2;
}

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

export interface HostResponse extends BaseResponse {
  name: string;
  parent: string;
  provider?: string;
}

// The collector is not part of the data model. It retrieves setup information such as prometheus properties
export interface CollectorsResponse {
  recType: string;
  identity: string;
  startTime: number;
  endTime: number;
}
