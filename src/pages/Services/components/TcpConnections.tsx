import { FC } from 'react';

import ServiceBiFlowList from './ServiceBiFlowList';
import { tcpBiFlowColumns, tcpSelectOptions } from '../../../core/components/SkBiFlowList/BiFlowList.constants';
import { setColumnVisibility } from '../../../core/components/SkTable/SkTable.utils';
import { initActiveConnectionsQueryParams } from '../Services.constants';

interface TcpConnectionsProps {
  routingKey: string;
}

const TcpConnections: FC<TcpConnectionsProps> = function ({ routingKey }) {
  return (
    <ServiceBiFlowList
      options={tcpSelectOptions}
      columns={setColumnVisibility(tcpBiFlowColumns, { duration: false, endTime: false })}
      filters={{ ...initActiveConnectionsQueryParams, routingKey }}
    />
  );
};

export default TcpConnections;
