import { BASE_URL_COLLECTOR } from 'config';

const API_VERSION = '/api/v1alpha1';
const API_URL = `${BASE_URL_COLLECTOR}${API_VERSION}`;

// SITES
export const SITES_PATH = `${API_URL}/sites/`;
export const getSitePATH = (id: string) => `${SITES_PATH}${id}`;
export const getProcessesBySitePATH = (id: string) => `${SITES_PATH}${id}/processes`;
export const getRoutersBySitePATH = (id: string) => `${SITES_PATH}${id}/routers`;
export const getLinksBySitePATH = (id: string) => `${SITES_PATH}${id}/links`;
export const getHostsBySitePATH = (id: string) => `${SITES_PATH}${id}/hosts`;

// HOSTS
export const HOSTS_PATH = `${API_URL}/hosts/`;

// ROUTERS
export const ROUTERS_PATH = `${API_URL}/routers/`;
export const getRouterPATH = (id: string) => `${ROUTERS_PATH}${id}`;

// LINKS
export const LINKS_PATH = `${API_URL}/links/`;
export const getLinkPATH = (id: string) => `${LINKS_PATH}${id}`;

// CONNECTORS
export const CONNECTORS_PATH = `${API_URL}/connectors/`;
export const getConnectorPATH = (id: string) => `${CONNECTORS_PATH}${id}`;

// LISTENERS
export const LISTENERS_PATH = `${API_URL}/listeners/`;
export const getListenerPATH = (id: string) => `${LISTENERS_PATH}${id}`;

// PROCESSES
export const PROCESSES_PATH = `${API_URL}/processes/`;
export const geProcessPATH = (id: string) => `${PROCESSES_PATH}${id}`;
export const getConnectorByProcessPATH = (id: string) => `${PROCESSES_PATH}${id}/connector`;

// PROCESS_GROUPS
export const PROCESS_GROUPS_PATH = `${API_URL}/processgroups/`;
export const getProcessGroupPATH = (id: string) => `${PROCESS_GROUPS_PATH}${id}`;
export const getProcessesByProcessGroupPATH = (id: string) =>
    `${PROCESS_GROUPS_PATH}${id}/processes`;

// ADDRESSES
export const ADDRESSES_PATH = `${API_URL}/addresses/`;
export const getFlowsPairsByAddressPATH = (id: string) => `${ADDRESSES_PATH}${id}/flowpairs`;
export const getProcessesByAddressPATH = (id: string) => `${ADDRESSES_PATH}${id}/processes`;
export const getConnectorsByAddressPATH = (id: string) => `${ADDRESSES_PATH}${id}/connectors`;

// CONNECTIONS
const FLOWPAIRS_PATH = `${API_URL}/flowpairs/`;
export const getFlowPairPATH = (id: string) => `${FLOWPAIRS_PATH}${id}`;

export const SITE_PAIRS_PATH = `${API_URL}/sitepairs/`;
export const getSitePairPATH = (id: string) => `${SITE_PAIRS_PATH}${id}`;

export const PROCESS_GROUP_PAIRS_PATH = `${API_URL}/processgrouppairs/`;
export const getProcessGroupPairPATH = (id: string) => `${PROCESS_GROUP_PAIRS_PATH}${id}`;

export const PROCESS_PAIRS_PATH = `${API_URL}/processpairs/`;
export const getProcessPairPATH = (id: string) => `${PROCESS_PAIRS_PATH}${id}`;
