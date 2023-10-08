import { FC, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { SiteResponse } from '@API/REST.interfaces';
import { siteNameAndIdSeparator } from '@config/prometheus';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import Metrics from '@pages/shared/Metrics';
import { ExpandedMetricSections, SelectedMetricFilters } from '@pages/shared/Metrics/Metrics.interfaces';

import SitesController from '../services';
import { QueriesSites } from '../Sites.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'site-metric-filter';
const PREFIX_METRIC_OPEN_SECTION_CACHE_KEY = `site-open-metric-sections`;

const processQueryParams = { endTime: 0 };

interface OverviewProps {
  site: SiteResponse;
}

const Overview: FC<OverviewProps> = function ({ site }) {
  const { identity: siteId, name } = site;

  const { data: sites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites());
  const { data: hosts } = useQuery([QueriesSites.GetHostsBySiteId, siteId], () => RESTApi.fetchHostsBySite(siteId));
  const { data: links } = useQuery([QueriesSites.GetLinksBySiteId, siteId], () => RESTApi.fetchLinksBySite(siteId));
  const { data: routers } = useQuery([QueriesSites.GetRouters], () => RESTApi.fetchRouters());
  const { data: processesData } = useQuery(
    [QueriesSites.GetProcessesBySiteId, { ...processQueryParams, parent: siteId }],
    () => RESTApi.fetchProcesses({ ...processQueryParams, parent: siteId })
  );

  const handleSelectedFilters = useCallback(
    (filters: SelectedMetricFilters) => {
      storeDataToSession(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${siteId}`, filters);
    },
    [siteId]
  );

  const handleGetExpandedSectionsConfig = useCallback(
    (sections: ExpandedMetricSections) => {
      storeDataToSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${siteId}`, sections);
    },
    [siteId]
  );

  if (!sites || !routers || !hosts || !links || !processesData) {
    return null;
  }

  const sitePairs = SitesController.getSitePairs(sites, links, routers);
  const processResults = processesData.results.filter(({ processRole }) => processRole !== 'internal');

  const startTime = processResults.reduce((acc, process) => Math.min(acc, process.startTime), 0);
  const sourceSites = [{ destinationName: `${name}${siteNameAndIdSeparator}${siteId}` }];
  const destSites = Object.values([site, ...sitePairs]).map(({ name: siteName, identity }) => ({
    destinationName: `${siteName}${siteNameAndIdSeparator}${identity}`
  }));

  return (
    <Metrics
      key={siteId}
      sourceSites={sourceSites}
      destSites={destSites}
      defaultOpenSections={{
        ...getDataFromSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${siteId}`)
      }}
      defaultMetricFilterValues={{
        sourceSite: `${name}${siteNameAndIdSeparator}${siteId}`,
        ...getDataFromSession<SelectedMetricFilters>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${siteId}`)
      }}
      startTimeLimit={startTime}
      configFilters={{
        sourceSites: { disabled: true },
        destinationProcesses: { hide: true },
        sourceProcesses: { hide: true }
      }}
      onGetMetricFiltersConfig={handleSelectedFilters}
      onGetExpandedSectionsConfig={handleGetExpandedSectionsConfig}
    />
  );
};

export default Overview;
