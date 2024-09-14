import { FC } from 'react';

import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { useMetricSessionHandlers } from '@pages/shared/Metrics/hooks/useSessionHandler';
import { SitePairsResponse, SiteResponse } from '@sk-types/REST.interfaces';

import { useSiteProcessOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  site: SiteResponse;
}

const Overview: FC<OverviewProps> = function ({ site: { identity: id, name } }) {
  const { pairsTx, pairsRx } = useSiteProcessOverviewData(id);
  const { selectedFilters, visibleMetrics, setSelectedFilters, setVisibleMetrics } = useMetricSessionHandlers(id);

  const sourceSites = [{ destinationName: name }];
  const destSites = removeDuplicatesFromArrayOfObjects([
    ...createDestSites(pairsTx, 'destinationName'),
    ...createDestSites(pairsRx, 'sourceName')
  ]);

  const uniqueProtocols = [...new Set([...pairsTx, ...pairsRx].map((item) => item.protocol))];

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

const createDestSites = (sitePairs: SitePairsResponse[], nameKey: keyof SitePairsResponse) => [
  ...(sitePairs || []).map(({ [nameKey]: namePair }) => ({
    destinationName: namePair as string,
    siteName: ''
  }))
];
