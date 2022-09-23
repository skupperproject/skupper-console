import { BASE_URL, BASE_URL_COLLECTOR } from 'config';

// APIs PATHS
export const DATA_URL = `${BASE_URL}/DATA`;

// SITES
export const SITES_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/sites`;

export const getSitePATH = (id: string) => `${SITES_PATH}/${id}`;
export const getProcessesBySitePATH = (id: string) => `${SITES_PATH}/${id}/processes`;
export const getRoutersBySitePATH = (id: string) => `${SITES_PATH}/${id}/routers`;
export const getLinksBySitePATH = (id: string) => `${SITES_PATH}/${id}/links`;
export const getHostsBySitePATH = (id: string) => `${SITES_PATH}/${id}/hosts`;

// HOSTS
export const HOSTS_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/hosts`;

export const getHostPATH = (id: string) => `${HOSTS_PATH}/${id}`;

// ROUTERS
export const ROUTERS_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/routers`;

export const getRouterPATH = (id: string) => `${ROUTERS_PATH}/${id}`;

// LINKS
export const LINKS_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/links`;

export const getLinkPATH = (id: string) => `${LINKS_PATH}/${id}`;

// CONNECTORS
export const CONNECTORS_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/connectors`;

// LISTENERS
export const LISTENERS_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/listeners`;

// PROCESSES
export const PROCESSES_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/processes`;

export const getFlowsByProcessPATH = (id: string) => `${PROCESSES_PATH}/${id}/flows`;
export const getConnectorByProcessPATH = (id: string) => `${PROCESSES_PATH}/${id}/connector`;

// PROCESS_GROUPS
export const PROCESS_GROUPS_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/processgroups`;

export const getServicePATH = (id: string) => `${PROCESS_GROUPS_PATH}/${id}`;
export const getProcessesByServicePATH = (id: string) => `${PROCESS_GROUPS_PATH}/${id}/processes`;

// FLOW AGGREGATES
const FLOW_AGGREGATES_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/flowaggregates`;

export const FLOW_AGGREGATES_SITES_PATH = `${FLOW_AGGREGATES_PATH}/sites`;
export const FLOW_AGGREGATES_PROCESS_GROUPS_PATH = `${FLOW_AGGREGATES_PATH}/processgroups`;
export const FLOW_AGGREGATES_PROCESSES_PATH = `${FLOW_AGGREGATES_PATH}/processes`;

// ADDRESSES
export const ADDRESSES_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/addresses`;

export const getFlowsPairsByAddressPATH = (id: string) => `${ADDRESSES_PATH}/${id}/flowpairs`;
export const getProcessesByAddressPATH = (id: string) => `${ADDRESSES_PATH}/${id}/processes`;

// FLOWPAIRS
export const FLOWPAIRS_PATH = `${BASE_URL_COLLECTOR}/api/v1alpha1/flowpairs`;
