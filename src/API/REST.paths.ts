import { API_URL } from '@config/config';

export const getUser = () => `${API_URL}/user/`;
export const logout = () => `${API_URL}/logout?nonce=${Date.now()}`;

const SITES_PATH = `${API_URL}/sites/`;
export const getSitesPATH = () => SITES_PATH;
export const getSitePATH = (id: string) => `${SITES_PATH}${id}`;
export const getLinksBySitePATH = (id: string) => `${SITES_PATH}${id}/links`;

const LINKS_PATH = `${API_URL}/links/`;
export const getLinksPATH = () => LINKS_PATH;
export const getLinkPATH = (id: string) => `${LINKS_PATH}${id}`;

const PROCESSES_PATH = `${API_URL}/processes/`;
export const geProcessesPATH = () => PROCESSES_PATH;
export const geProcessPATH = (id: string) => `${PROCESSES_PATH}${id}`;

const COMPONENT_PATH = `${API_URL}/processgroups/`;
export const getComponentsPATH = () => COMPONENT_PATH;
export const getComponentPATH = (id: string) => `${COMPONENT_PATH}${id}`;

const SERVICE_PATH = `${API_URL}/addresses/`;
export const getServicesPATH = () => SERVICE_PATH;
export const getServicePATH = (id: string) => `${SERVICE_PATH}${id}`;
export const getProcessPairsByServicePATH = (id: string) => `${SERVICE_PATH}${id}/processpairs`;

const CONNECTIONS_PATH = `${API_URL}/connections/`;
export const getFlowPairsPATH = () => CONNECTIONS_PATH;
export const getFlowPairPATH = (id: string) => `${CONNECTIONS_PATH}${id}`;

const SITE_PAIRS_PATH = `${API_URL}/sitepairs/`;
export const getSitePairsPATH = () => SITE_PAIRS_PATH;
export const getSitePairPATH = (id: string) => `${SITE_PAIRS_PATH}${id}`;

const PROCESS_GROUP_PAIRS_PATH = `${API_URL}/processgrouppairs/`;
export const getProcessGroupPairsPATH = () => PROCESS_GROUP_PAIRS_PATH;
export const getProcessGroupPairPATH = (id: string) => `${PROCESS_GROUP_PAIRS_PATH}${id}`;

const PROCESS_PAIRS_PATH = `${API_URL}/processpairs/`;
export const getProcessPairsPATH = () => PROCESS_PAIRS_PATH;
export const getProcessPairPairPATH = (id: string) => `${PROCESS_PAIRS_PATH}${id}`;
