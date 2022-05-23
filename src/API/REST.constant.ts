import { BASE_URL, BASE_URL_FLOW_COLLECTOR } from 'config';

export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

// HTTP URLs
export const DATA_URL = `${BASE_URL}/DATA`;
export const FLOWS_VAN_ADDRESSES = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/vanaddrs`;
export const FLOWS_LINKS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/links`;
export const FLOWS_BY_VAN_ADDRESS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/flows`;
export const FLOWS_TOPOLOGY = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/topology`;
