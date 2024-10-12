import { FC } from 'react';

import { Protocols } from '@API/REST.enum';
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
  const uniqueProtocols = extractUniqueValues([...pairsTx, ...pairsRx], 'observedApplicationProtocols').join();
  const uniqueProtocolsAarray = (
    uniqueProtocols.length && uniqueProtocols.includes(',') ? uniqueProtocols.split(',') : uniqueProtocols
  ) as Protocols[];
  // Default destination site for Prometheus queries, representing the sum of all destination sites.
  // We explicitly set this prop to ensure the destination site is included in the Prometheus query; otherwise, the result will also include values from the source site itself.
  const destSite = destSites.map(({ destinationName }) => destinationName).join('|');

  return (
    <Metrics
      key={id}
      sourceSites={sourceSites}
      destSites={destSites}
      availableProtocols={uniqueProtocolsAarray}
      defaultOpenSections={visibleMetrics}
      defaultMetricFilterValues={{
        sourceSite: name,
        destSite,
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
