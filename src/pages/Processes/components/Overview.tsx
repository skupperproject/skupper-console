import { FC } from 'react';

import { extractUniqueValues } from '@core/utils/extractUniqueValues';
import { mapDataToMetricFilterOptions } from '@core/utils/getResourcesFromPairs';
import Metrics from '@pages/shared/Metrics';
import { useMetricSessionHandlers } from '@pages/shared/Metrics/hooks/useMetricsSessionHandler';
import { ProcessResponse } from '@sk-types/REST.interfaces';

import { useProcessOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  process: ProcessResponse;
}

const Overview: FC<OverviewProps> = function ({ process: { identity: id, name } }) {
  const { pairsTx, pairsRx } = useProcessOverviewData(id);
  const { selectedFilters, visibleMetrics, setSelectedFilters, setVisibleMetrics } = useMetricSessionHandlers(id);

  const destProcesses = [
    ...mapDataToMetricFilterOptions(pairsTx, 'destinationName', 'destinationSiteName'),
    ...mapDataToMetricFilterOptions(pairsRx, 'sourceName', 'sourceSiteName')
  ];
  const destSites = mapDataToMetricFilterOptions(destProcesses, 'siteName');
  const uniqueProtocols = extractUniqueValues([...pairsTx, ...pairsRx], 'protocol');

  return (
    <Metrics
      key={id}
      destSites={destSites}
      destProcesses={destProcesses}
      availableProtocols={uniqueProtocols}
      defaultOpenSections={visibleMetrics}
      defaultMetricFilterValues={{
        sourceProcess: name,
        ...selectedFilters
      }}
      configFilters={{
        destSites: {
          hide: destSites.length === 0
        },
        destinationProcesses: {
          hide: destProcesses.length === 0
        },
        sourceProcesses: { disabled: true },
        sourceSites: { hide: true }
      }}
      onGetMetricFiltersConfig={setSelectedFilters}
      onGetExpandedSectionsConfig={setVisibleMetrics}
    />
  );
};

export default Overview;
