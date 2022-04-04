export const CONNECTION_TIMEOUT = 10 * 1000;
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

// HTTP URLs
const BASE_URL = `${window.location.protocol}//${window.location.host}`;

export const DATA_URL = `${BASE_URL}/data`;
export const SITE_URL = `${BASE_URL}/site`;
export const LINKS = `${BASE_URL}/links`;
export const TOKENS = `${BASE_URL}/tokens`;
export const TARGETS = `${BASE_URL}/targets`;
export const SERVICES = `${BASE_URL}/services`;
export const FLOWS = `${BASE_URL}/flows`;
export const MONITORING_STATS = `${BASE_URL}/monitoring-stats`;
export const ROUTERS_STAT = `${BASE_URL}/routers-stats`;
export const VANS_STAT = `${BASE_URL}/vans-stats`;
export const FLOWS_TOPOLOGY_ROUTERS_LINKS = `${BASE_URL}/flows/topology/routers/links`;
