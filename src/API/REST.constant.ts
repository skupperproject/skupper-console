import { BASE_URL_COLLECTOR } from 'config';

const API_VERSION = '/api/v1alpha1';
const API_URL = `${BASE_URL_COLLECTOR}${API_VERSION}`;

//COLLECTORS
// ask to Skupper the url to call the api that retrieves the url of the prometheus server
const COLLECTORS_PATH = `${API_URL}/collectors/`;
export const getCollectorsPATH = () => COLLECTORS_PATH;

// SITES
const SITES_PATH = `${API_URL}/sites/`;
export const getSitesPATH = () => SITES_PATH;
export const getSitePATH = (id: string) => `${SITES_PATH}${id}`;
export const getProcessesBySitePATH = (id: string) => `${SITES_PATH}${id}/processes`;
export const getRoutersBySitePATH = (id: string) => `${SITES_PATH}${id}/routers`;
export const getLinksBySitePATH = (id: string) => `${SITES_PATH}${id}/links`;
export const getHostsBySitePATH = (id: string) => `${SITES_PATH}${id}/hosts`;

// HOSTS
const HOSTS_PATH = `${API_URL}/hosts/`;
export const getHostsPATH = () => HOSTS_PATH;

// ROUTERS
const ROUTERS_PATH = `${API_URL}/routers/`;
export const getRoutersPATH = () => ROUTERS_PATH;
export const getRouterPATH = (id: string) => `${ROUTERS_PATH}${id}`;

// LINKS
const LINKS_PATH = `${API_URL}/links/`;
export const getLinksPATH = () => LINKS_PATH;
export const getLinkPATH = (id: string) => `${LINKS_PATH}${id}`;

// PROCESSES
const PROCESSES_PATH = `${API_URL}/processes/`;
export const geProcessesPATH = () => PROCESSES_PATH;
export const geProcessPATH = (id: string) => `${PROCESSES_PATH}${id}`;
export const getAddressesByProcessPATH = (id: string) => `${PROCESSES_PATH}${id}/addresses`;

// PROCESS_GROUPS
const PROCESS_GROUPS_PATH = `${API_URL}/processgroups/`;
export const getProcessGroupsPATH = () => PROCESS_GROUPS_PATH;
export const getProcessGroupPATH = (id: string) => `${PROCESS_GROUPS_PATH}${id}`;
export const getProcessesByProcessGroupPATH = (id: string) => `${PROCESS_GROUPS_PATH}${id}/processes`;

// ADDRESSES
const ADDRESSES_PATH = `${API_URL}/addresses/`;
export const getAddressesPath = () => ADDRESSES_PATH;
export const getFlowsPairsByAddressPATH = (id: string) => `${ADDRESSES_PATH}${id}/flowpairs`;
export const getProcessesByAddressPATH = (id: string) => `${ADDRESSES_PATH}${id}/processes`;

// CONNECTIONS
const FLOWPAIRS_PATH = `${API_URL}/flowpairs/`;
export const getFlowPairsPATH = () => FLOWPAIRS_PATH;
export const getFlowPairPATH = (id: string) => `${FLOWPAIRS_PATH}${id}`;

const SITE_PAIRS_PATH = `${API_URL}/sitepairs/`;
export const getSitePairsPATH = () => SITE_PAIRS_PATH;
export const getSitePairPATH = (id: string) => `${SITE_PAIRS_PATH}${id}`;

const PROCESS_GROUP_PAIRS_PATH = `${API_URL}/processgrouppairs/`;
export const getProcessGroupPairsPATH = () => PROCESS_GROUP_PAIRS_PATH;
export const getProcessGroupPairPATH = (id: string) => `${PROCESS_GROUP_PAIRS_PATH}${id}`;

const PROCESS_PAIRS_PATH = `${API_URL}/processpairs/`;
export const getProcessPairsPATH = () => PROCESS_PAIRS_PATH;
