export const CONNECTION_TIMEOUT = 10 * 1000;
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

// HTTP URLs
export const BASE_URL = `${window.location.protocol}//${window.location.host}`;

export const DATA_URL = `${BASE_URL}/data`;
export const SITE_URL = `${BASE_URL}/site`;
export const LINKS = `${BASE_URL}/links`;
export const TOKENS = `${BASE_URL}/tokens`;
export const TARGETS = `${BASE_URL}/targets`;
export const SERVICES = `${BASE_URL}/services`;
export const FLOWS = `${BASE_URL}/flows`;
export const FLOWS_VAN_ADDRESSES = `${BASE_URL}/flows/addresses`;
export const MONITORING_STATS = `${BASE_URL}/monitoring-stats`;
export const ROUTERS_STAT = `${BASE_URL}/routers-stats`;
export const VANS_STAT = `${BASE_URL}/vans-stats`;
