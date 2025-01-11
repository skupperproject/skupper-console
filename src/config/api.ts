import { RestResources } from '../API/REST.enum';

/*
Base URL used to connect to the Network Observer backend.
If not explicitly set via environment variables, it defaults to the current host.
*/
const BASE_URL_NETWORK_OBSERVER = process.env.OBSERVER_URL || `${window.location.protocol}//${window.location.host}`;
export const API_VERSION = process.env.API_VERSION ? `/${process.env.API_VERSION}` : '/api/v1alpha1';
export const API_URL = `${BASE_URL_NETWORK_OBSERVER}${API_VERSION}`;

export const PROMETHEUS_SUFFIX = '/internal/prom';
export const PROMETHEUS_URL_SINGLE_QUERY = `${API_URL}${PROMETHEUS_SUFFIX}/query/`;
export const PROMETHEUS_URL_RANGE_QUERY = `${API_URL}${PROMETHEUS_SUFFIX}/rangequery/`;

// Error message to display when a request times out
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

/*
  Backend -> Frontend props mapper
  This object maps the property names from the backend API response
  to the property names expected by the frontend components. It helps
  in transforming the data received from the backend into a format
  that can be used directly by the frontend for display or further processing.
*/
export const backendToFrontendPropertyMapper: Record<string, string> = {
  identity: 'identity',
  startTime: 'startTime',
  endTime: 'endTime',
  username: 'username',
  authType: 'authType',
  name: 'name',
  nameSpace: 'nameSpace',
  siteVersion: 'siteVersion',
  platform: 'platform',
  routerCount: 'routerCount',
  parent: 'parent',
  namespace: 'namespace',
  hostName: 'hostName',
  buildVersion: 'buildVersion',
  imageName: 'imageName',
  imageVersion: 'imageVersion',
  mode: 'mode',
  cost: 'cost',
  routerAccessId: 'routerAccessId',
  destinationRouterId: 'destinationRouterId',
  destinationRouterName: 'destinationRouterName',
  destinationSiteId: 'destinationSiteId',
  destinationSiteName: 'destinationSiteName',
  routerId: 'routerId',
  routerName: 'routerName',
  sourceSiteId: 'sourceSiteId',
  sourceSiteName: 'sourceSiteName',
  role: 'role',
  status: 'status',
  octets: 'octets',
  octetsReverse: 'octetsReverse',
  sourceId: 'sourceId',
  sourceName: 'sourceName',
  destinationId: 'destinationId',
  destinationName: 'destinationName',
  processGroupRole: 'processGroupRole',
  processCount: 'processCount',
  parentName: 'parentName',
  groupIdentity: 'groupIdentity',
  groupName: 'groupName',
  sourceHost: 'sourceHost',
  processBinding: 'processBinding',
  processRole: 'processRole',
  addresses: 'services',
  address: 'service',
  addressId: 'serviceId',
  processPairs: 'processPairs',
  prometheusKey: 'prometheusKey',
  processPairsKey: 'processPairsKey',
  metrics: 'metrics',
  bytes: 'bytes',
  byteRate: 'byteRate',
  latency: 'latency',
  connectionId: 'connectionId',
  method: 'method',
  traceRouters: 'traceRouters',
  traceSites: 'traceSites',
  routingKey: 'routingKey',
  duration: 'duration',
  listenerId: 'listenerId',
  connectorId: 'connectorId',
  listenerError: 'listenerError',
  proxyHost: 'proxyHost',
  proxyPort: 'proxyPort',
  destHost: 'destHost',
  destPort: 'destPort',
  sourcePort: 'sourcePort'
};

/**
 * Base paths for API resources.
 */
export const apiEndpoints = {
  SITES: `${API_URL}/${RestResources.Sites}`,
  LINKS: `${API_URL}/${RestResources.RouterLinks}`,
  COMPONENTS: `${API_URL}/${RestResources.Components}`,
  PROCESSES: `${API_URL}/${RestResources.Processes}`,
  SERVICES: `${API_URL}/${RestResources.Services}`,
  LISTENERS: `${API_URL}/${RestResources.Listeners}`,
  CONNECTORS: `${API_URL}/${RestResources.Connectors}`,
  TCP_CONNECTIONS: `${API_URL}/${RestResources.TcpConnections}`,
  HTTP_REQUESTS: `${API_URL}/${RestResources.HttpRequests}`,
  SITE_PAIRS: `${API_URL}/${RestResources.SiteDataLinks}`,
  COMPONENT_PAIRS: `${API_URL}/${RestResources.ComponentDataLinks}`,
  PROCESS_PAIRS: `${API_URL}/${RestResources.ProcessDataLinks}`
};
