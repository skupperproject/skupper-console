import { FC } from 'react';

import { extractUniqueValues } from '@core/utils/extractUniqueValues';
import { mapDataToMetricFilterOptions } from '@core/utils/getResourcesFromPairs';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { useMetricSessionHandlers } from '@pages/shared/Metrics/hooks/useMetricsSessionHandler';
import { PairsResponse, SiteResponse } from '@sk-types/REST.interfaces';

import { useSiteOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  site: SiteResponse;
}

const Overview: FC<OverviewProps> = function ({ site: { identity: id, name } }) {
  const { pairsTx, pairsRx } = useSiteOverviewData(id);
  const { selectedFilters, visibleMetrics, setSelectedFilters, setVisibleMetrics } = useMetricSessionHandlers(id);

  const sourceSites = [{ destinationName: name }];
  const destSites = removeDuplicatesFromArrayOfObjects([
    ...mapDataToMetricFilterOptions<PairsResponse>(pairsTx, 'destinationName'),
    ...mapDataToMetricFilterOptions<PairsResponse>(pairsRx, 'sourceName')
  ]);
  const uniqueProtocols = extractUniqueValues([...pairsTx, ...pairsRx], 'protocol');

  return (
    <Metrics
      key={id}
      sourceSites={sourceSites}
      destSites={destSites}
      availableProtocols={uniqueProtocols}
      defaultOpenSections={visibleMetrics}
      defaultMetricFilterValues={{
        sourceSite: name,
        ...selectedFilters
      }}
      configFilters={{
        sourceSites: { disabled: true },
        destSites: { hide: !destSites.length },
        destinationProcesses: { hide: true },
        sourceProcesses: { hide: true }
      }}
      onGetMetricFiltersConfig={setSelectedFilters}
      onGetExpandedSectionsConfig={setVisibleMetrics}
    />
  );
};

export default Overview;
