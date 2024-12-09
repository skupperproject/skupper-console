/**  URL config: contains configuration options and constants related to backend URLs and routing */
const BASE_URL_NETWORK_OBSERVER = process.env.COLLECTOR_URL || `${window.location.protocol}//${window.location.host}`;
const API_VERSION = '/api/v1alpha1';
const PROMETHEUS_SUFFIX = '/internal/prom';

// Base URL for the collector backend. Defaults to current host if not set in environment variables.
export const API_URL = `${BASE_URL_NETWORK_OBSERVER}${API_VERSION}`;
export const PROMETHEUS_URL = `${API_URL}${PROMETHEUS_SUFFIX}`;

// Error message to display when a request times out
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

/* 
  Backend -> Frontend props mapper
  This object maps the property names from the backend API response
  to the property names expected by the frontend components. It helps
  in transforming the data received from the backend into a format
  that can be used directly by the frontend for display or further processing.
*/
export const backendToFrontendPropertydMapper: Record<string, string> = {
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
  addresses: 'addresses',
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
  SITES: `${API_URL}/sites`,
  LINKS: `${API_URL}/routerlinks`,
  COMPONENTS: `${API_URL}/processgroups`,
  PROCESSES: `${API_URL}/processes`,
  SERVICES: `${API_URL}/addresses`,
  LISTENERS: `${API_URL}/listeners`,
  CONNECTORS: `${API_URL}/connectors`,
  TCP_CONNECTIONS: `${API_URL}/connections`,
  HTTP_REQUESTS: `${API_URL}/applicationflows`,
  SITE_PAIRS: `${API_URL}/sitepairs`,
  COMPONENT_PAIRS: `${API_URL}/processgrouppairs`,
  PROCESS_PAIRS: `${API_URL}/processpairs`
};
