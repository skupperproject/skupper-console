import { BASE_URL, BASE_URL_FLOW_COLLECTOR } from 'config';

export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

// HTTP URLs
export const DATA_URL = `${BASE_URL}/DATA`;
export const MONITORING_FLOWS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/all`;
