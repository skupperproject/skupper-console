/**
 * API functions to interact with various resources in the system.
 * These functions provide a consistent interface for fetching data from the server
 * for resources like sites, processes, components, services, and others.
 * Each function handles the necessary API call, including query parameters, response processing, and aggregation if necessary.
 * This module ensures modularity and reusability across the application.
 */

import { fetchApiData, fetchApiDataWithMapper } from './apiClient';
import {
  getSiteById,
  getComponentById,
  getProcessById,
  getLinkById,
  getSitePairById,
  getComponentPairById,
  getTcpConnectionById,
  getHttpRequestById,
  getProcessPairById,
  getProcessPairsByServiceId,
  getAllSites,
  getAllLinks,
  getAllComponents,
  getAllProcesses,
  getAllServices,
  getAllListeners,
  getAllConnectors,
  getAllTcpConnections,
  getAllHttpRequests,
  getAllSitePairs,
  getAllComponentPairs,
  getAllProcessPairs,
  getServiceById,
  getUser,
  logout
} from './REST.endpoints';
import { aggregateDistinctPairs, aggregateLinksBySite } from './REST.utils';
import {
  ComponentResponse,
  ServiceResponse,
  ProcessResponse,
  BiFlowResponse,
  SiteResponse,
  RouterLinkResponse,
  ProcessPairsResponse,
  QueryFilters,
  ApiResponse,
  PairsResponse,
  UserResponse,
  ApplicationFlowResponse,
  ListenerResponse,
  ConnectorResponse,
  TransportFlowResponse
} from '../types/REST.interfaces';

// API Service: A collection of API call methods for different resource types.
export const RESTApi = {
  // Authentication API: Logout functionality
  fetchLogout: async (): Promise<string> => fetchApiData(logout(), { validateStatus: () => true }),

  // User API: Fetch current user details
  fetchUser: async (): Promise<UserResponse> => fetchApiData(getUser()),

  // === SITES APIs ===
  fetchSites: async (options?: QueryFilters): Promise<ApiResponse<SiteResponse[]>> =>
    fetchApiDataWithMapper(getAllSites(), options),

  fetchSite: async (id: string, options?: QueryFilters): Promise<ApiResponse<SiteResponse>> =>
    fetchApiDataWithMapper(getSiteById(id), options),

  // === PROCESS APIs ===
  fetchProcesses: async (options?: QueryFilters): Promise<ApiResponse<ProcessResponse[]>> =>
    fetchApiDataWithMapper(getAllProcesses(), options),

  fetchProcess: async (id: string, options?: QueryFilters): Promise<ApiResponse<ProcessResponse>> =>
    fetchApiDataWithMapper(getProcessById(id), options),

  // === COMPONENTS APIs ===
  fetchComponents: async (options?: QueryFilters): Promise<ApiResponse<ComponentResponse[]>> =>
    fetchApiDataWithMapper(getAllComponents(), options),

  fetchComponent: async (id: string, options?: QueryFilters): Promise<ApiResponse<ComponentResponse>> =>
    fetchApiDataWithMapper(getComponentById(id), options),

  // === LINKS APIs ===
  fetchLinks: async (options?: QueryFilters): Promise<ApiResponse<RouterLinkResponse[]>> => {
    const removeInvalidAndDuplicatesRouterLinks = (results: RouterLinkResponse[]): RouterLinkResponse[] =>
      results.filter(({ sourceSiteId, destinationSiteId }) => destinationSiteId && sourceSiteId !== destinationSiteId);

    const data = await fetchApiDataWithMapper<RouterLinkResponse[]>(getAllLinks(), options);

    // Filter and aggregate the links data
    return { ...data, results: removeInvalidAndDuplicatesRouterLinks(aggregateLinksBySite(data.results)) };
  },

  fetchLink: async (id: string, options?: QueryFilters): Promise<ApiResponse<RouterLinkResponse>> =>
    fetchApiDataWithMapper(getLinkById(id), options),

  // === LISTENERS AND CONNECTORS ===
  fetchListeners: async (options?: QueryFilters): Promise<ApiResponse<ListenerResponse[]>> =>
    fetchApiDataWithMapper(getAllListeners(), options),

  fetchConnectors: async (options?: QueryFilters): Promise<ApiResponse<ConnectorResponse[]>> =>
    fetchApiDataWithMapper<ConnectorResponse[]>(getAllConnectors(), options),

  // === SERVICES APIs ===
  fetchServices: async (options?: QueryFilters): Promise<ApiResponse<ServiceResponse[]>> =>
    fetchApiDataWithMapper(getAllServices(), options),

  fetchService: async (id: string, options?: QueryFilters): Promise<ApiResponse<ServiceResponse>> =>
    fetchApiDataWithMapper(getServiceById(id), options),

  fetchProcessPairsByService: async (
    id: string,
    options?: QueryFilters
  ): Promise<ApiResponse<ProcessPairsResponse[]>> => {
    const data = await fetchApiDataWithMapper<ProcessPairsResponse[]>(getProcessPairsByServiceId(id), options);

    // Aggregate process pairs by service
    return { ...data, results: aggregateDistinctPairs(data.results) };
  },

  // === BIFLOW APIs ===
  fetchTransportFlows: async (options?: QueryFilters): Promise<ApiResponse<TransportFlowResponse[]>> =>
    fetchApiDataWithMapper(getAllTcpConnections(), options),

  fetchTransportFlow: async (id: string, options?: QueryFilters): Promise<ApiResponse<BiFlowResponse>> =>
    fetchApiDataWithMapper(getTcpConnectionById(id), options),

  fetchApplicationFlows: async (options?: QueryFilters): Promise<ApiResponse<ApplicationFlowResponse[]>> =>
    fetchApiDataWithMapper(getAllHttpRequests(), options),

  fetchApplicationFlow: async (id: string, options?: QueryFilters): Promise<ApiResponse<ApplicationFlowResponse>> =>
    fetchApiDataWithMapper(getHttpRequestById(id), options),

  // === RESOURCE LINKS APIs ===
  fetchSitesPairs: async (options?: QueryFilters): Promise<ApiResponse<PairsResponse[]>> => {
    const data = await fetchApiDataWithMapper<PairsResponse[]>(getAllSitePairs(), options);

    // Aggregate pairs data for sites
    return { ...data, results: aggregateDistinctPairs(data.results) };
  },

  fetchSitePairs: async (id: string, options?: QueryFilters): Promise<ApiResponse<PairsResponse>> =>
    fetchApiDataWithMapper(getSitePairById(id), options),

  fetchComponentsPairs: async (options?: QueryFilters): Promise<ApiResponse<PairsResponse[]>> => {
    const data = await fetchApiDataWithMapper<PairsResponse[]>(getAllComponentPairs(), options);

    // Aggregate pairs data for components
    return { ...data, results: aggregateDistinctPairs(data.results) };
  },

  fetchComponentPairs: async (id: string, options?: QueryFilters): Promise<ApiResponse<PairsResponse>> =>
    fetchApiDataWithMapper(getComponentPairById(id), options),

  fetchProcessesPairs: async (options?: QueryFilters): Promise<ApiResponse<ProcessPairsResponse[]>> => {
    const data = await fetchApiDataWithMapper<ProcessPairsResponse[]>(getAllProcessPairs(), options);

    // Aggregate pairs data for processes
    return { ...data, results: aggregateDistinctPairs(data.results) as ProcessPairsResponse[] };
  },

  fetchProcessesPair: async (id: string, options?: QueryFilters): Promise<ApiResponse<ProcessPairsResponse>> =>
    fetchApiDataWithMapper(getProcessPairById(id), options)
};
