import { FC } from 'react';

import { tcpBiFlowColumns, tcpSelectOptions } from '../../../core/components/SkBiFlowList/BiFlowList.constants';
import BiFlowLogs from '../../shared/BiFlowLogs';
import { initTerminatedConnectionsQueryParams } from '../Services.constants';

interface TcpConnectionsProps {
  routingKey: string;
}

const TcpTerminatedConnections: FC<TcpConnectionsProps> = function ({ routingKey }) {
  return (
    <BiFlowLogs
      options={tcpSelectOptions}
      columns={tcpBiFlowColumns}
      filters={{ ...initTerminatedConnectionsQueryParams, routingKey }}
    />
  );
};

export default TcpTerminatedConnections;
