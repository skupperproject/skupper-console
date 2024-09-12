import { FC, useCallback } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import Metrics from '@pages/shared/Metrics';
import { ExpandedMetricSections, QueryMetricsParams } from '@sk-types/Metrics.interfaces';
import { ComponentResponse, ProcessResponse } from '@sk-types/REST.interfaces';

import { QueriesComponent } from '../ProcessGroups.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'component-metric-filter';
const PREFIX_METRIC_OPEN_SECTION_CACHE_KEY = `component-open-metric-sections`;

interface OverviewProps {
  component: ComponentResponse;
  processes: ProcessResponse[];
}

const Overview: FC<OverviewProps> = function ({ component, processes }) {
  const { identity: componentId, name } = component;

  const pairsTxQueryParams = {
    sourceId: componentId
  };

  const pairsRxQueryParams = {
    destinationId: componentId
  };

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesComponent.GetProcessGroupPairs, pairsTxQueryParams],
        queryFn: () => RESTApi.fetchProcessGroupsPairs(pairsTxQueryParams)
      },
      {
        queryKey: [QueriesComponent.GetProcessGroupPairs, pairsRxQueryParams],
        queryFn: () => RESTApi.fetchProcessGroupsPairs(pairsRxQueryParams)
      }
    ]
  });

  const handleSelectedFilters = useCallback(
    (filters: QueryMetricsParams) => {
      storeDataToSession(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${componentId}`, filters);
    },
    [componentId]
  );

  const handleGetExpandedSectionsConfig = useCallback(
    (sections: ExpandedMetricSections) => {
      storeDataToSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${componentId}`, sections);
    },
    [componentId]
  );

  const uniqueProtocols = [...new Set([...pairsTx, ...pairsRx].map((item) => item.protocol))];
  const serverNameFilters = Object.values(processes).map(({ name: destinationName }) => ({ destinationName }));

  return (
    <Metrics
      key={componentId}
      sourceProcesses={serverNameFilters}
      availableProtocols={uniqueProtocols}
      defaultOpenSections={{
        ...getDataFromSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${componentId}`)
      }}
      defaultMetricFilterValues={{
        sourceComponent: name,
        ...getDataFromSession<QueryMetricsParams>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${componentId}`)
      }}
      configFilters={{
        sourceSites: { hide: true },
        destSites: { hide: true },
        destinationProcesses: { hide: true }
      }}
      onGetMetricFiltersConfig={handleSelectedFilters}
      onGetExpandedSectionsConfig={handleGetExpandedSectionsConfig}
    />
  );
};

export default Overview;
