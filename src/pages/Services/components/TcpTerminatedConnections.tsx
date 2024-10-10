import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { tcpBiFlowColumns, tcpSelectOptions } from '@core/components/SkBiFlowList/BiFlowList.constants';

import ProcessPairsSankeyChart from './ProcessPairsSankey';
import ServiceBiFlowList from './ServiceBiFlowList';
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
        <ServiceBiFlowList
          options={tcpSelectOptions}
          columns={tcpBiFlowColumns}
          filters={{ ...initOldConnectionsQueryParams, routingKey: name }}
        />
      </StackItem>
    </Stack>
  );
};

export default TcpTerminatedConnections;
