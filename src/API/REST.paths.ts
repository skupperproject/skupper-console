import { API_URL } from '@config/config';

import { composePath } from './REST.utils';

export const getUser = () => `${API_URL}/user`;
export const logout = () => `${API_URL}/logout?nonce=${Date.now()}`;

const SITES_PATH = `${API_URL}/sites`;
export const getSitesPATH = () => SITES_PATH;
export const getSitePATH = (id: string) => composePath([SITES_PATH, id]);

const LINKS_PATH = `${API_URL}/routerlinks`;
export const getLinksPATH = () => LINKS_PATH;
export const getLinkPATH = (id: string) => composePath([LINKS_PATH, id]);

const COMPONENTS_PATH = `${API_URL}/processgroups`;
export const getComponentsPATH = () => COMPONENTS_PATH;
export const getComponentPATH = (id: string) => composePath([COMPONENTS_PATH, id]);

const PROCESSES_PATH = `${API_URL}/processes`;
export const geProcessesPATH = () => PROCESSES_PATH;
export const geProcessPATH = (id: string) => composePath([PROCESSES_PATH, id]);

const SERVICES_PATH = `${API_URL}/addresses`;
export const getServicesPATH = () => SERVICES_PATH;
export const getServicePATH = (id: string) => composePath([SERVICES_PATH, id]);
export const getProcessPairsByServicePATH = (id: string) => composePath([SERVICES_PATH, id, 'processpairs']);

const TRANSPORT_FLOWS_PATH = `${API_URL}/connections`; // L4 flows
export const getTransportFlowsPATH = () => TRANSPORT_FLOWS_PATH;
export const getTransportFlow = (id: string) => composePath([TRANSPORT_FLOWS_PATH, id]);

const APPLICATION_FLOWS_PATH = `${API_URL}/applicationflows`; // L7 flows
export const getApplicationFlowsPATH = () => APPLICATION_FLOWS_PATH;
export const getApplicationFlowPATH = (id: string) => composePath([APPLICATION_FLOWS_PATH, id]);

const SITE_PAIRS_PATH = `${API_URL}/sitepairs`;
export const getSitePairsPATH = () => SITE_PAIRS_PATH;
export const getSitePairPATH = (id: string) => composePath([SITE_PAIRS_PATH, id]);

const COMPONENT_PAIRS_PATH = `${API_URL}/processgrouppairs`;
export const getComponentsPairsPATH = () => COMPONENT_PAIRS_PATH;
export const getComponentPairPATH = (id: string) => composePath([COMPONENT_PAIRS_PATH, id]);

const PROCESS_PAIRS_PATH = `${API_URL}/processpairs`;
export const getProcessPairsPATH = () => PROCESS_PAIRS_PATH;
export const getProcessPairPairPATH = (id: string) => composePath([PROCESS_PAIRS_PATH, id]);
