import { RESTApi } from '@API/REST.api';
import { RemoteFilterOptions } from '@sk-types/REST.interfaces';

import { QueriesSites } from './Sites.enum';

// Queries Details
const fetchSites = () => ({ queryKey: [QueriesSites.GetSites], queryFn: () => RESTApi.fetchSites() });
const fetchHostsBySiteId = (siteId: string) => ({
  queryKey: [QueriesSites.GetHostsBySiteId, siteId],
  queryFn: () => RESTApi.fetchHostsBySite(siteId)
});

const fetchLinksBySiteId = (siteId: string, queryParams: RemoteFilterOptions) => ({
  queryKey: [QueriesSites.GetLinksBySiteId, siteId],
  queryFn: () => RESTApi.fetchLinksBySite(siteId, queryParams)
});

const fetchProcessesBySiteId = (siteId: string, queryParams: RemoteFilterOptions) => ({
  queryKey: [QueriesSites.GetProcessesBySiteId, { ...queryParams, parent: siteId }],
  queryFn: () => RESTApi.fetchProcesses({ ...queryParams, parent: siteId })
});

export const queryDetails = {
  fetchSites,
  fetchHostsBySiteId,
  fetchLinksBySiteId,
  fetchProcessesBySiteId
};
