/**
 * Utility functions to construct API paths for various resources.
 * These functions ensure consistent and reusable path generation across the application.
 */

import { composePath } from './REST.utils';
import { apiEndpoints, API_URL } from '../config/api';

/**
 * Authentication-related endpoints.
 */
export const getUser = (): string => `${API_URL}/user`;
export const logout = (): string => `${API_URL}/logout?nonce=${Date.now()}`;

/**
 * Site-related endpoints.
 */
export const getAllSites = (): string => apiEndpoints.SITES;
export const getSiteById = (id: string): string => composePath([apiEndpoints.SITES, id]);

/**
 * Router link-related endpoints.
 */
export const getAllLinks = (): string => apiEndpoints.LINKS;
export const getLinkById = (id: string): string => composePath([apiEndpoints.LINKS, id]);

/**
 * Component-related endpoints.
 */
export const getAllComponents = (): string => apiEndpoints.COMPONENTS;
export const getComponentById = (id: string): string => composePath([apiEndpoints.COMPONENTS, id]);

/**
 * Process-related endpoints.
 */
export const getAllProcesses = (): string => apiEndpoints.PROCESSES;
export const getProcessById = (id: string): string => composePath([apiEndpoints.PROCESSES, id]);

/**
 * Service-related endpoints.
 */
export const getAllServices = (): string => apiEndpoints.SERVICES;
export const getServiceById = (id: string): string => composePath([apiEndpoints.SERVICES, id]);

/**
 * Listener-related endpoints.
 */
export const getAllListeners = (): string => apiEndpoints.LISTENERS;

/**
 * Connector-related endpoints.
 */
export const getAllConnectors = (): string => apiEndpoints.CONNECTORS;

/**
 * Tcp connection endpoints.
 */
export const getAllTcpConnections = (): string => apiEndpoints.TRANSPORT_FLOWS;
export const getTcpConnectionById = (id: string): string => composePath([apiEndpoints.TRANSPORT_FLOWS, id]);

/**
 * Http requests endpoints.
 */
export const getAllHttpRequests = (): string => apiEndpoints.APPLICATION_FLOWS;
export const getHttpRequestById = (id: string): string => composePath([apiEndpoints.APPLICATION_FLOWS, id]);

/**
 * Site pair-related endpoints.
 */
export const getAllSitePairs = (): string => apiEndpoints.SITE_PAIRS;
export const getSitePairById = (id: string): string => composePath([apiEndpoints.SITE_PAIRS, id]);

/**
 * Component pair-related endpoints.
 */
export const getAllComponentPairs = (): string => apiEndpoints.COMPONENT_PAIRS;
export const getComponentPairById = (id: string): string => composePath([apiEndpoints.COMPONENT_PAIRS, id]);

/**
 * Process pair-related endpoints.
 */
export const getAllProcessPairs = (): string => apiEndpoints.PROCESS_PAIRS;
export const getProcessPairById = (id: string): string => composePath([apiEndpoints.PROCESS_PAIRS, id]);
export const getProcessPairsByServiceId = (id: string): string =>
  composePath([apiEndpoints.SERVICES, id, 'processpairs']);
