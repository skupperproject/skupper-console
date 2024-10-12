import { FC } from 'react';

import { Protocols } from '@API/REST.enum';
import { extractUniqueValues } from '@core/utils/extractUniqueValues';
import Metrics from '@pages/shared/Metrics';
import { useMetricSessionHandlers } from '@pages/shared/Metrics/hooks/useMetricsSessionHandler';
import { ComponentResponse, ProcessResponse } from '@sk-types/REST.interfaces';

import { useComponentOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  component: ComponentResponse;
  processes: ProcessResponse[];
}

const Overview: FC<OverviewProps> = function ({ component: { identity: id, name }, processes }) {
  const { pairsTx, pairsRx } = useComponentOverviewData(id);
  const { selectedFilters, visibleMetrics, setSelectedFilters, setVisibleMetrics } = useMetricSessionHandlers(id);

  const uniqueProtocols = extractUniqueValues([...pairsTx, ...pairsRx], 'observedApplicationProtocols').join();
  const uniqueProtocolsAarray = (
    uniqueProtocols.length && uniqueProtocols.includes(',') ? uniqueProtocols.split(',') : uniqueProtocols
  ) as Protocols[];

  const serverNameFilters = Object.values(processes).map(({ name: destinationName }) => ({ destinationName }));

  return (
    <Metrics
      key={id}
      sourceProcesses={serverNameFilters}
      availableProtocols={uniqueProtocolsAarray}
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
