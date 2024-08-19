import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { AvailableProtocols } from '@API/REST.enum';
import { tcpFlowPairsColumns, tcpSelectOptions } from '@core/components/SkFlowPairsTable/FlowPair.constants';

import ProcessPairsSankeyChart from './ProcessPairsSankey';
import ExposedServers from '../components/ExposedServers';
import FlowPairsTable from '../components/FlowPairsTable';
import Overview from '../components/Overview';
import {
  TAB_0_KEY,
  TAB_1_KEY,
  TAB_2_KEY,
  TAB_3_KEY,
  initActiveConnectionsQueryParams,
  initOldConnectionsQueryParams,
  tcpColumns
} from '../Services.constants';

interface TcpConnectionsProps {
  serviceId: string;
  serviceName: string;
  protocol: AvailableProtocols;
  viewSelected: string;
}

const TcpConnections: FC<TcpConnectionsProps> = function ({ serviceId, serviceName, protocol, viewSelected }) {
  const service = {
    [TAB_2_KEY]: { filters: initActiveConnectionsQueryParams, columns: tcpColumns },
    [TAB_3_KEY]: { filters: initOldConnectionsQueryParams, columns: tcpFlowPairsColumns }
  };

  return (
    <>
      {viewSelected === TAB_0_KEY && <Overview serviceId={serviceId} serviceName={serviceName} protocol={protocol} />}

      {viewSelected === TAB_1_KEY && <ExposedServers serviceId={serviceId} serviceName={serviceName} />}

      {(viewSelected === TAB_2_KEY || viewSelected === TAB_3_KEY) && (
        <Stack hasGutter>
          <StackItem>
            <ProcessPairsSankeyChart serviceId={serviceId} serviceName={serviceName} />
          </StackItem>
          <StackItem>
            <FlowPairsTable
              serviceId={serviceId}
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
