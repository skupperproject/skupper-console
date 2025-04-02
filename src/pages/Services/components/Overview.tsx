import { FC } from 'react';

import { Protocols } from '../../../API/REST.enum';
import Metrics from '../../../core/components/Metrics';
import { extractUniqueValues } from '../../../core/utils/extractUniqueValues';
import { mapDataToMetricFilterOptions } from '../../../core/utils/getResourcesFromPairs';
import { useServiceOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  id: string;
  name: string;
}

const Overview: FC<OverviewProps> = function ({ id, name }) {
  const { pairs } = useServiceOverviewData(id);

  // prometheus read a process name as id
  const sourceProcesses = mapDataToMetricFilterOptions(
    pairs,
    'sourceName',
    'sourceName',
    'sourceSiteId',
    'sourceSiteName'
  );
  const destProcesses = mapDataToMetricFilterOptions(
    pairs,
    'destinationName',
    'destinationName',
    'destinationSiteId',
    'destinationSiteName'
  );
  const sourceSites = mapDataToMetricFilterOptions(pairs, 'sourceSiteId', 'sourceSiteName');
  const destSites = mapDataToMetricFilterOptions(pairs, 'destinationSiteId', 'destinationSiteName');

  const uniqueProtocols = extractUniqueValues(pairs, 'observedApplicationProtocols').join();
  const uniqueProtocolsAarray = (
    uniqueProtocols.length && uniqueProtocols.includes(',') ? uniqueProtocols.split(',') : uniqueProtocols
  ) as Protocols[];

  const sourceSite = sourceSites.map((site) => site.id).join('|');
  const destSite = destSites.map((site) => site.id).join('|');
  const sourceProcess = sourceProcesses.map((process) => process.id).join('|');
  const destProcess = destProcesses.map((process) => process.id).join('|');

  return (
    <Metrics
      key={id}
      sessionKey={id}
      sourceSites={sourceSites}
      destSites={destSites}
      sourceProcesses={sourceProcesses}
      destProcesses={destProcesses}
      availableProtocols={uniqueProtocolsAarray}
      defaultMetricFilterValues={{
        service: name, // prometheus use a service name as id
        sourceSite,
        sourceProcess,
        destSite,
        destProcess
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
    />
  );
};

export default Overview;
