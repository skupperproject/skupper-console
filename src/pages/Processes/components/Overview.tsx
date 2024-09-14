import { FC } from 'react';

import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { useMetricSessionHandlers } from '@pages/shared/Metrics/hooks/useSessionHandler';
import { ProcessPairsResponse, ProcessResponse } from '@sk-types/REST.interfaces';

import { useProcessOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  process: ProcessResponse;
}

const Overview: FC<OverviewProps> = function ({ process: { identity: id, name } }) {
  const { pairsTx, pairsRx } = useProcessOverviewData(id);
  const { selectedFilters, visibleMetrics, setSelectedFilters, setVisibleMetrics } = useMetricSessionHandlers(id);

  // Format destination processes and sites
  const destProcesses = formatDestinationProcesses(pairsTx, pairsRx);
  const destSites = removeDuplicatesFromArrayOfObjects(
    destProcesses.map(({ siteName }) => ({ destinationName: siteName }))
  );

  const uniqueProtocols = [...new Set([...pairsTx, ...pairsRx].map((item) => item.protocol))];

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

// Utility function to format destination processes
const formatDestinationProcesses = (txData: ProcessPairsResponse[], rxData: ProcessPairsResponse[]) => {
  const formatProcess = (
    data: ProcessPairsResponse[],
    keyName: keyof ProcessPairsResponse,
    siteKey: keyof ProcessPairsResponse
  ) => data.map((item) => ({ destinationName: item[keyName] as string, siteName: item[siteKey] as string }));

  const txProcesses = formatProcess(txData, 'destinationName', 'destinationSiteName');
  const rxProcesses = formatProcess(rxData, 'sourceName', 'sourceSiteName');

  return removeDuplicatesFromArrayOfObjects([...txProcesses, ...rxProcesses]);
};
