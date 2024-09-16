import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { tcpSelectOptions } from '@core/components/SkFlowPairsTable/FlowPair.constants';

import FlowPairsTable from './FlowPairsTable';
import ProcessPairsSankeyChart from './ProcessPairsSankey';
import { initActiveConnectionsQueryParams, tcpColumns } from '../Services.constants';

interface TcpConnectionsProps {
  id: string;
  name: string;
}

const TcpConnections: FC<TcpConnectionsProps> = function ({ id, name }) {
  return (
    <Stack hasGutter>
      <StackItem>
        <ProcessPairsSankeyChart serviceId={id} serviceName={name} />
      </StackItem>
      <StackItem>
        <FlowPairsTable
          options={tcpSelectOptions}
          columns={tcpColumns}
          filters={{ ...initActiveConnectionsQueryParams, routingKey: name }}
        />
      </StackItem>
    </Stack>
  );
};

export default TcpConnections;
