import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { tcpFlowPairsColumns, tcpSelectOptions } from '@core/components/SkFlowPairsTable/FlowPair.constants';

import FlowPairsTable from './FlowPairsTable';
import ProcessPairsSankeyChart from './ProcessPairsSankey';
import ExposedServers from '../components/ExposedServers';
import Overview from '../components/Overview';
import {
  TAB_0_KEY,
  TAB_1_KEY,
  TAB_3_KEY,
  TAB_4_KEY,
  initActiveConnectionsQueryParams,
  initOldConnectionsQueryParams,
  tcpColumns
} from '../Services.constants';

interface TcpConnectionsProps {
  id: string;
  name: string;
  viewSelected: string;
}

const TcpConnections: FC<TcpConnectionsProps> = function ({ id, name, viewSelected }) {
  const service = {
    [TAB_3_KEY]: {
      filters: { ...initActiveConnectionsQueryParams, routingKey: name },
      columns: tcpColumns
    },
    [TAB_4_KEY]: {
      filters: { ...initOldConnectionsQueryParams, routingKey: name },
      columns: tcpFlowPairsColumns
    }
  };

  return (
    <>
      {viewSelected === TAB_0_KEY && <Overview id={id} name={name} />}
      {viewSelected === TAB_1_KEY && <ExposedServers serviceId={id} serviceName={name} />}
      {(viewSelected === TAB_3_KEY || viewSelected === TAB_4_KEY) && (
        <Stack hasGutter>
          <StackItem>
            <ProcessPairsSankeyChart serviceId={id} serviceName={name} />
          </StackItem>
          <StackItem>
            <FlowPairsTable
              options={tcpSelectOptions}
              columns={service[viewSelected].columns}
              filters={service[viewSelected].filters}
            />
          </StackItem>
        </Stack>
      )}
    </>
  );
};

export default TcpConnections;
