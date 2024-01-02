import { FC, useCallback } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { SiteResponse } from '@API/REST.interfaces';
import { prometheusSiteNameAndIdSeparator } from '@config/prometheus';
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

  const [{ data: sites }, { data: links }, { data: routers }, { data: processesData }] = useSuspenseQueries({
    queries: [
      { queryKey: [QueriesSites.GetSites], queryFn: () => RESTApi.fetchSites() },
      {
        queryKey: [QueriesSites.GetLinksBySiteId, siteId],
        queryFn: () => RESTApi.fetchLinksBySite(siteId)
      },
      {
        queryKey: [QueriesSites.GetRouters],
        queryFn: () => RESTApi.fetchRouters()
      },
      {
        queryKey: [QueriesSites.GetProcessesBySiteId, { ...processQueryParams, parent: siteId }],
        queryFn: () => RESTApi.fetchProcesses({ ...processQueryParams, parent: siteId })
      }
    ]
  });

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

  const sitePairs = SitesController.getSitePairs(sites, links, routers);
  const processResults = processesData.results.filter(({ processRole }) => processRole !== 'internal');

  const startTime = processResults.reduce((acc, process) => Math.min(acc, process.startTime), 0);
  const sourceSites = [{ destinationName: `${name}${prometheusSiteNameAndIdSeparator}${siteId}` }];
  const destSites = Object.values([site, ...sitePairs]).map(({ name: siteName, identity }) => ({
    destinationName: `${siteName}${prometheusSiteNameAndIdSeparator}${identity}`
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
        sourceSite: `${name}${prometheusSiteNameAndIdSeparator}${siteId}`,
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
