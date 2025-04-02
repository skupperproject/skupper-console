import { FC } from 'react';

import { Protocols } from '../../../API/REST.enum';
import Metrics from '../../../core/components/Metrics';
import { extractUniqueValues } from '../../../core/utils/extractUniqueValues';
import { mapDataToMetricFilterOptions } from '../../../core/utils/getResourcesFromPairs';
import { ProcessResponse } from '../../../types/REST.interfaces';
import { useProcessOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  process: ProcessResponse;
}

const Overview: FC<OverviewProps> = function ({ process: { identity: id, name } }) {
  const { pairsTx, pairsRx } = useProcessOverviewData(id);

  // prometheus read a process name as id
  const sourceProcesses = [{ id: name, destinationName: name }];
  const destProcesses = [
    ...mapDataToMetricFilterOptions(
      pairsTx,
      'destinationName',
      'destinationName',
      'destinationSiteId',
      'destinationSiteName'
    ),
    ...mapDataToMetricFilterOptions(pairsRx, 'sourceName', 'sourceName', 'sourceSiteId', 'sourceSiteName')
  ];
  const destSites = mapDataToMetricFilterOptions(destProcesses, 'parentId', 'parentName');
  const uniqueProtocols = extractUniqueValues([...pairsTx, ...pairsRx], 'observedApplicationProtocols').join();
  const uniqueProtocolsAarray = (
    uniqueProtocols.length && uniqueProtocols.includes(',') ? uniqueProtocols.split(',') : uniqueProtocols
  ) as Protocols[];

  const destSite = destSites.map((site) => site.id).join('|');
  const destProcess = destProcesses.map((process) => process.id).join('|');

  return (
    <Metrics
      key={id}
      sessionKey={id}
      destSites={destSites}
      sourceProcesses={sourceProcesses}
      destProcesses={destProcesses}
      availableProtocols={uniqueProtocolsAarray}
      defaultMetricFilterValues={{
        sourceProcess: name, // prometheus use a process name as id
        destSite,
        destProcess
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
    />
  );
};

export default Overview;
