import { FC, useCallback } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { composePrometheusSiteLabel } from '@API/Prometheus.utils';
import { RESTApi } from '@API/REST.api';
import { SiteResponse } from '@API/REST.interfaces';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { ExpandedMetricSections, QueryMetricsParams } from '@pages/shared/Metrics/Metrics.interfaces';

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

  const [{ data: siteTxData }, { data: siteRxData }] = useSuspenseQueries({
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

  const destProcessesRx = [
    ...(siteTxData || []).map(({ destinationName, destinationId }) => ({
      destinationName: composePrometheusSiteLabel(destinationName, destinationId),
      siteName: ''
    }))
  ];

  const destProcessesTx = [
    ...(siteRxData || []).map(({ sourceName, sourceId }) => ({
      destinationName: composePrometheusSiteLabel(sourceName, sourceId),
      siteName: ''
    }))
  ];

  const sourceSites = [{ destinationName: composePrometheusSiteLabel(name, siteId) }];
  const destSites = removeDuplicatesFromArrayOfObjects([...destProcessesTx, ...destProcessesRx]);

  return (
    <Metrics
      key={siteId}
      sourceSites={sourceSites}
      destSites={destSites}
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
