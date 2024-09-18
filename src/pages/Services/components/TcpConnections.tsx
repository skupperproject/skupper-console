import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { tcpBiFlowColumns, tcpSelectOptions } from '@core/components/SkBiFlowList/BiFlowList.constants';
import { setColumnVisibility } from '@core/components/SkTable/SkTable.utils';

import ProcessPairsSankeyChart from './ProcessPairsSankey';
import ServiceBiFlow from './ServiceBiFlowList';
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
        <ServiceBiFlow
          options={tcpSelectOptions}
          columns={setColumnVisibility(tcpBiFlowColumns, { duration: false, endTime: false })}
          filters={{ ...initActiveConnectionsQueryParams, routingKey: name }}
        />
      </StackItem>
    </Stack>
  );
};

export default TcpConnections;
