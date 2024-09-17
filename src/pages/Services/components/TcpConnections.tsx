import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { tcpFlowPairsColumns, tcpSelectOptions } from '@core/components/SkFlowPairsTable/FlowPair.constants';
import { setColumnVisibility } from '@core/components/SkTable/SkTable.utils';

import FlowPairsTable from './FlowPairsTable';
import ProcessPairsSankeyChart from './ProcessPairsSankey';
import { initActiveConnectionsQueryParams } from '../Services.constants';

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
          columns={setColumnVisibility(tcpFlowPairsColumns, { duration: false, endTime: false })}
          filters={{ ...initActiveConnectionsQueryParams, routingKey: name }}
        />
      </StackItem>
    </Stack>
  );
};

export default TcpConnections;
