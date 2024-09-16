import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { tcpFlowPairsColumns, tcpSelectOptions } from '@core/components/SkFlowPairsTable/FlowPair.constants';

import FlowPairsTable from './FlowPairsTable';
import ProcessPairsSankeyChart from './ProcessPairsSankey';
import { initOldConnectionsQueryParams } from '../Services.constants';

interface TcpConnectionsProps {
  id: string;
  name: string;
}

const TcpTerminatedConnections: FC<TcpConnectionsProps> = function ({ id, name }) {
  return (
    <Stack hasGutter>
      <StackItem>
        <ProcessPairsSankeyChart serviceId={id} serviceName={name} />
      </StackItem>
      <StackItem>
        <FlowPairsTable
          options={tcpSelectOptions}
          columns={tcpFlowPairsColumns}
          filters={{ ...initOldConnectionsQueryParams, routingKey: name }}
        />
      </StackItem>
    </Stack>
  );
};

export default TcpTerminatedConnections;
