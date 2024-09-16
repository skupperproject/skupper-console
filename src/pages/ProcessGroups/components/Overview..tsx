import { FC } from 'react';

import { extractUniqueValues } from '@core/utils/extractUniqueValues';
import Metrics from '@pages/shared/Metrics';
import { useMetricSessionHandlers } from '@pages/shared/Metrics/hooks/useSessionHandler';
import { ComponentResponse, ProcessResponse } from '@sk-types/REST.interfaces';

import { useComponentOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  component: ComponentResponse;
  processes: ProcessResponse[];
}

const Overview: FC<OverviewProps> = function ({ component: { identity: id, name }, processes }) {
  const { pairsTx, pairsRx } = useComponentOverviewData(id);
  const { selectedFilters, visibleMetrics, setSelectedFilters, setVisibleMetrics } = useMetricSessionHandlers(id);

  const uniqueProtocols = extractUniqueValues([...pairsTx, ...pairsRx], 'protocol');
  const serverNameFilters = Object.values(processes).map(({ name: destinationName }) => ({ destinationName }));

  return (
    <Metrics
      key={id}
      sourceProcesses={serverNameFilters}
      availableProtocols={uniqueProtocols}
      defaultOpenSections={visibleMetrics}
      defaultMetricFilterValues={{
        sourceComponent: name,
        ...selectedFilters
      }}
      configFilters={{
        sourceSites: { hide: true },
        destSites: { hide: true },
        destinationProcesses: { hide: true }
      }}
      onGetMetricFiltersConfig={setSelectedFilters}
      onGetExpandedSectionsConfig={setVisibleMetrics}
    />
  );
};

export default Overview;
