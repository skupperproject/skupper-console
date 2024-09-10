import { FC, useCallback } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { composePrometheusSiteLabel } from '@API/Prometheus.utils';
import { RESTApi } from '@API/REST.api';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { ExpandedMetricSections, QueryMetricsParams } from '@sk-types/Metrics.interfaces';
import { SitePairsResponse, SiteResponse } from '@sk-types/REST.interfaces';

import { QueriesSites } from '../Sites.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'site-metric-filter';
const PREFIX_METRIC_OPEN_SECTION_CACHE_KEY = `site-open-metric-sections`;

interface OverviewProps {
  site: SiteResponse;
}

const Overview: FC<OverviewProps> = function ({ site }) {
  const { identity: siteId, name } = site;

  const sitePairsTxQueryParams = {
    sourceId: siteId
  };

  const sitePairsRxQueryParams = {
    destinationId: siteId
  };

  const [{ data: sitePairsTx }, { data: sitePairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesSites.GetSitesPairs, sitePairsTxQueryParams],
        queryFn: () => RESTApi.fetchSitesPairs(sitePairsTxQueryParams)
      },
      {
        queryKey: [QueriesSites.GetSitesPairs, sitePairsRxQueryParams],
        queryFn: () => RESTApi.fetchSitesPairs(sitePairsRxQueryParams)
      }
    ]
  });

  const handleSelectedFilters = useCallback(
    (filters: QueryMetricsParams) => {
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

  const sourceSites = [{ destinationName: composePrometheusSiteLabel(name, siteId) }];
  const destSites = removeDuplicatesFromArrayOfObjects([
    ...createDestProcesses(sitePairsTx, 'destinationName', 'destinationId'),
    ...createDestProcesses(sitePairsRx, 'sourceName', 'sourceId')
  ]);

  const uniqueProtocols = [...new Set([...sitePairsTx, ...sitePairsRx].map((item) => item.protocol))];

  return (
    <Metrics
      key={siteId}
      sourceSites={sourceSites}
      destSites={destSites}
      availableProtocols={uniqueProtocols}
      defaultOpenSections={{
        ...getDataFromSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${siteId}`)
      }}
      defaultMetricFilterValues={{
        sourceSite: composePrometheusSiteLabel(name, siteId),
        ...getDataFromSession<QueryMetricsParams>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${siteId}`)
      }}
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

const createDestProcesses = (
  sitePairs: SitePairsResponse[],
  nameKey: keyof SitePairsResponse,
  idKey: keyof SitePairsResponse
) => [
  ...(sitePairs || []).map(({ [nameKey]: namePair, [idKey]: idPair }) => ({
    destinationName: composePrometheusSiteLabel(namePair as string, idPair as string),
    siteName: ''
  }))
];
