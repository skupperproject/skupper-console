import { RESTApi } from '@API/REST.api';
import { RequestOptions } from '@API/REST.interfaces';

import { QueriesSites } from './Sites.enum';

// Queries Details
const fetchSites = () => ({ queryKey: [QueriesSites.GetSites], queryFn: () => RESTApi.fetchSites() });
const fetchHostsBySiteId = (siteId: string) => ({
  queryKey: [QueriesSites.GetHostsBySiteId, siteId],
  queryFn: () => RESTApi.fetchHostsBySite(siteId)
});

const fetchLinksBySiteId = (siteId: string, queryParams: RequestOptions) => ({
  queryKey: [QueriesSites.GetLinksBySiteId, siteId],
  queryFn: () => RESTApi.fetchLinksBySite(siteId, queryParams)
});

const fetchProcessesBySiteId = (siteId: string, queryParams: RequestOptions) => ({
  queryKey: [QueriesSites.GetProcessesBySiteId, { ...queryParams, parent: siteId }],
  queryFn: () => RESTApi.fetchProcesses({ ...queryParams, parent: siteId })
});

export const queryDetails = {
  fetchSites,
  fetchHostsBySiteId,
  fetchLinksBySiteId,
  fetchProcessesBySiteId
};
