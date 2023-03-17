import { AxiosError, AxiosRequestConfig } from 'axios';

import { AvailableProtocols, SortDirection } from './REST.enum';

export type ResponseWrapper<T> = {
  results: T;
  totalCount: number;
  count: number;
  timeRangeCount: number;
  status: string;
  timestamp: number;
  elapsed: number;
  queryParams: RequestOptions;
};
export interface RequestOptions {
  filter?: string;
  filters?: Record<string, string>;
  offset?: number;
  limit?: number;
  sortDirection?: SortDirection;
  sortName?: string;
  timeRangeStart?: number;
  timeRangeEnd?: number;
  timeRangeOperation?: number; // 0: intersect , 1: contains, 2: within
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
  processGroupRole: 'external' | 'internal';
}

interface EntityMetricsResponse {
  octetsSent: number;
  octetSentRate: number;
  octetsReceived: number;
  octetReceivedRate: number;
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
  processRole: 'external' | 'internal';
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

export interface HostResponse extends EntityBaseResponse {
  parent: string;
  provider: string;
}

export interface AddressResponse extends EntityBaseResponse {
  listenerCount: number;
  connectorCount: number;
  totalFlows: number;
  currentFlows: number;
  protocol: AvailableProtocols;
}

export interface ConnectionTCP extends BaseResponse {
  parent: string;
  counterFlow: string;
  octets: number;
  octetRate: number;
  octetsUnacked: number;
  windowSize: number;
  sourceHost: string;
  sourcePort: string;
  latency: number;
  process: string;
  processName: string;
  endTime?: number;
  protocol: AvailableProtocols;
}

export interface RequestHTTP extends BaseResponse {
  counterFlow: string;
  parent: string;
  octets: number;
  octetRate: number;
  method: string;
  latency: number;
  process: string;
  processName: string;
  endTime?: number;
  protocol: AvailableProtocols;
  streamIdentity: number;
  result: number;
  reason?: string;
  place: 1 | 2;
}

export interface FlowPairsResponse extends BaseResponse {
  sourceSiteId: string;
  sourceSiteName: string;
  destinationSiteId: string;
  destinationSiteName: string;
  protocol: string;
  forwardFlow: ConnectionTCP & RequestHTTP;
  counterFlow: ConnectionTCP & RequestHTTP;
  flowTrace: string;
  siteAggregateId: string;
  processGroupAggregateId: string;
  processAggregateId: string;
  endTime?: number;
}

export interface ProcessPairs extends BaseResponse {
  sourceSiteId: string;
  sourceSiteName: string;
  destinationSiteId: string;
  destinationSiteName: string;
  protocol: string;
  forwardFlow: ConnectionTCP & RequestHTTP;
  counterFlow: ConnectionTCP & RequestHTTP;
  flowTrace: string;
  siteAggregateId: string;
  processGroupAggregateId: string;
  processAggregateId: string;
  endTime?: number;
}

export interface FlowAggregatesResponse extends BaseResponse {
  rectType: string;
  pairType: string;
  recordCount: number;
  sourceId: string;
  sourceName: string;
  sourceOctets: number;
  sourceOctetRate?: number;
  sourceMinLatency: number;
  sourceMaxLatency: number;
  sourceAverageLatency: number;
  destinationId: string;
  destinationName: string;
  destinationOctets: number;
  destinationOctetRate?: number;
  destinationMinLatency: number;
  destinationAverageLatency: number;
}

export interface CollectorsResponse {
  recType: 'COLLECTOR';
  identity: string;
  startTime: number;
  endTime: number;
  PrometheusHost: string;
  PrometheusAuthMethod: string;
  PrometheusUser: string;
  PrometheusPassword: string;
}
