export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

const BASE_URL = process.env.API_HOST || `${window.location.protocol}//${window.location.host}`;

// HTTP URLs
export const DATA_URL = `${BASE_URL}/data`;

export const SITES = `${BASE_URL}/sites`;
export const SITES_SERVICES = `${BASE_URL}/sites/services`;

export const SERVICES = `${BASE_URL}/services`;

export const DEPLOYMENTS = `${BASE_URL}/deployments`;

export const MONITORING_FLOWS = `${BASE_URL}/flows`;
export const MONITORING_NETWORK_STATS = `${MONITORING_FLOWS}/network-stats`;

export const MONITORING_CONNECTIONS = `${MONITORING_FLOWS}/connections`;
export const MONITORING_ROUTERS_STAT = `${MONITORING_FLOWS}/routers-stats`;
export const MONITORING_SERVICES_STATS = `${MONITORING_FLOWS}/services-stats`;
export const MONITORING_ROUTERS_TOPOLOGY = `${MONITORING_FLOWS}/topology/network`;
