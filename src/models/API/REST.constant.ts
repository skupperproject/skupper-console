export const CONNECTION_TIMEOUT = 10 * 1000;
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

// HTTP URLs
const BASE_URL = `${window.location.protocol}//${window.location.host}`;

export const DATA_URL = `${BASE_URL}/data`;

export const SITES_SERVICES = `${BASE_URL}/sites/services`;

export const SERVICES = `${BASE_URL}/services`;

export const DEPLOYMENTS = `${BASE_URL}/deployments`;

export const MONITORING_FLOWS = `${BASE_URL}/flows`;
export const MONITORING_NETWORK_STATS = `${MONITORING_FLOWS}/network-stats`;

export const MONITORING_CONNECTIONS = `${MONITORING_FLOWS}/connections`;
export const MONITORING_ROUTERS_STAT = `${MONITORING_FLOWS}/routers-stats`;
export const MONITORING_SERVICES_STATS = `${MONITORING_FLOWS}/services-stats`;
export const MONITORING_ROUTERS_TOPOLOGY = `${MONITORING_FLOWS}/topology/network`;
