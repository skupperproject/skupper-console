import { BASE_URL, BASE_URL_FLOW_COLLECTOR } from 'config';

export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

// HTTP URLs
export const DATA_URL = `${BASE_URL}/DATA`;
export const FLOWS_VAN_ADDRESSES = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/addresses`;
export const FLOWS_SITES = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/sites`;
export const FLOWS_SITE = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/site`;
export const FLOWS_ROUTERS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/routers`;
export const FLOWS_ROUTER = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/router`;
export const FLOWS_CONNECTORS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/connectors`;
export const FLOWS_CONNECTOR = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/connector`;
export const FLOWS_LISTENERS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/listeners`;
export const FLOWS_LISTENER = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/listener`;
export const FLOWS_LINKS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/links`;
export const FLOWS_LINK = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/link`;
export const FLOWS_BY_VAN_ADDRESS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/flows`;
export const FLOWS_FLOW = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/flow`;
export const FLOWS_TOPOLOGY = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/topology`;
export const FLOWS_RECORD_BY_ID = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/record`;
