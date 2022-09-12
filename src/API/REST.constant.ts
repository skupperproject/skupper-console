import { BASE_URL, BASE_URL_FLOW_COLLECTOR } from 'config';

export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';
export const LINK_DIRECTION = {
    OUTGOING: 'outgoing',
    INCOMING: 'incoming',
};

// HTTP URLs
export const DATA_URL = `${BASE_URL}/DATA`;
export const FLOWS_VAN_ADDRESSES = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/addresses`;
export const FLOWS_PROCESSES = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/processes`;
export const FLOWS_ROUTERS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/routers`;
export const FLOWS_CONNECTORS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/connectors`;
export const FLOWS_LISTENERS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/listeners`;
export const FLOWS_LINKS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/links`;
export const FLOWS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/flows`;
export const FLOWPAIRS = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/flowpairs`;

// Site Paths
export const SITES_PATH = `${BASE_URL_FLOW_COLLECTOR}/api/v1alpha1/sites`;

export const getSitePATH = (id: string) => `${SITES_PATH}/${id}`;
export const getProcessesBySitePATH = (id: string) => `${SITES_PATH}/${id}/processes`;
export const getRoutersBySitePATH = (id: string) => `${SITES_PATH}/${id}/routers`;
export const getLinksBySitePATH = (id: string) => `${SITES_PATH}/${id}/links`;
export const getHostsBySitePATH = (id: string) => `${SITES_PATH}/${id}/hosts`;

export const getFlowsPairsByVanAddressIdPATH = (id: string) =>
    `${FLOWS_VAN_ADDRESSES}/${id}/flowpairs`;
export const getFlowsByProcessIdPATH = (id: string) => `${FLOWS_PROCESSES}/${id}/flows`;
export const getProcessesByVanAddressIdPATH = (id: string) =>
    `${FLOWS_VAN_ADDRESSES}/${id}/processes`;
export const getConnectorByProcessIdPATH = (id: string) => `${FLOWS_PROCESSES}/${id}/connector`;
