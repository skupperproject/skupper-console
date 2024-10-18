import { FC } from 'react';

import { Protocols } from '../../../API/REST.enum';
import { extractUniqueValues } from '../../../core/utils/extractUniqueValues';
import { mapDataToMetricFilterOptions } from '../../../core/utils/getResourcesFromPairs';
import Metrics from '../../shared/Metrics';
import { useMetricSessionHandlers } from '../../shared/Metrics/hooks/useMetricsSessionHandler';
import { useServiceOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  id: string;
  name: string;
}

const Overview: FC<OverviewProps> = function ({ id, name }) {
  const { pairs } = useServiceOverviewData(id);
  const { selectedFilters, visibleMetrics, setSelectedFilters, setVisibleMetrics } = useMetricSessionHandlers(name);

  const sourceProcesses = mapDataToMetricFilterOptions(pairs, 'sourceName', 'sourceSiteName');
  const destProcesses = mapDataToMetricFilterOptions(pairs, 'destinationName', 'destinationSiteName');
  const sourceSites = mapDataToMetricFilterOptions(pairs, 'sourceSiteName');
  const destSites = mapDataToMetricFilterOptions(pairs, 'destinationSiteName');

  const uniqueProtocols = extractUniqueValues(pairs, 'observedApplicationProtocols').join();
  const uniqueProtocolsAarray = (
    uniqueProtocols.length && uniqueProtocols.includes(',') ? uniqueProtocols.split(',') : uniqueProtocols
  ) as Protocols[];

  return (
    <Metrics
      key={id}
      sourceSites={sourceSites}
      destSites={destSites}
      sourceProcesses={sourceProcesses}
      destProcesses={destProcesses}
      availableProtocols={uniqueProtocolsAarray}
      defaultOpenSections={visibleMetrics}
      defaultMetricFilterValues={{
        service: name,
        ...selectedFilters
      }}
      configFilters={{
        sourceSites: {
          disabled: !sourceSites.length
        },
        sourceProcesses: {
          disabled: !sourceProcesses.length
        },
        destSites: {
          hide: destSites.length === 0
        },
        destinationProcesses: {
          hide: destProcesses.length === 0
        }
      }}
      onGetMetricFiltersConfig={setSelectedFilters}
      onGetExpandedSectionsConfig={setVisibleMetrics}
    />
  );
};

export default Overview;
