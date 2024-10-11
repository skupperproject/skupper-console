import { FC } from 'react';

import { tcpBiFlowColumns, tcpSelectOptions } from '@core/components/SkBiFlowList/BiFlowList.constants';

import ServiceBiFlowList from './ServiceBiFlowList';
import { initOldConnectionsQueryParams } from '../Services.constants';

interface TcpConnectionsProps {
  routingKey: string;
}

const TcpTerminatedConnections: FC<TcpConnectionsProps> = function ({ routingKey }) {
  return (
    <ServiceBiFlowList
      options={tcpSelectOptions}
      columns={tcpBiFlowColumns}
      filters={{ ...initOldConnectionsQueryParams, routingKey }}
    />
  );
};

export default TcpTerminatedConnections;
