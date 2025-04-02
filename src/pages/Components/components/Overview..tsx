import { FC } from 'react';

import { Protocols } from '../../../API/REST.enum';
import Metrics from '../../../core/components/Metrics';
import { extractUniqueValues } from '../../../core/utils/extractUniqueValues';
import { ComponentResponse, ProcessResponse } from '../../../types/REST.interfaces';
import { useComponentOverviewData } from '../hooks/useOverviewData';

interface OverviewProps {
  component: ComponentResponse;
  processes: ProcessResponse[];
}

const Overview: FC<OverviewProps> = function ({ component: { identity: id, name }, processes }) {
  const { pairsTx, pairsRx } = useComponentOverviewData(id);

  const uniqueProtocols = extractUniqueValues([...pairsTx, ...pairsRx], 'observedApplicationProtocols').join();
  const uniqueProtocolsAarray = (
    uniqueProtocols.length && uniqueProtocols.includes(',') ? uniqueProtocols.split(',') : uniqueProtocols
  ) as Protocols[];

  // prometheus read a process name as id
  const componentProcesses = Object.values(processes).map(({ name: destinationName }) => ({
    id: destinationName,
    destinationName
  }));

  const sourceProcess = componentProcesses.map((process) => process.id).join('|');

  return (
    <Metrics
      key={id}
      sessionKey={id}
      sourceProcesses={componentProcesses}
      availableProtocols={uniqueProtocolsAarray}
      defaultMetricFilterValues={{
        sourceComponent: name, // prometheus use a process name as id
        sourceProcess
      }}
      configFilters={{
        sourceSites: { hide: true },
        destSites: { hide: true },
        destinationProcesses: { hide: true }
      }}
    />
  );
};

export default Overview;
