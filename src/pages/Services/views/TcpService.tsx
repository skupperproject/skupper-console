import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { tcpFlowPairsColumns, tcpSelectOptions } from '@pages/shared/FlowPairs/FlowPair.constants';

import ExposedServers from '../components/ExposedServers';
import FlowPairsService from '../components/FlowPairsService';
import Overview from '../components/Overview';
import ResourceDistributionFlowChart from '../components/ResourceDistrubutionFlowChart';
import {
  TAB_0_KEY,
  TAB_1_KEY,
  TAB_2_KEY,
  TAB_3_KEY,
  initActiveConnectionsQueryParams,
  initOldConnectionsQueryParams,
  tcpColumns
} from '../Services.constants';
import { ConnectionsByServiceProps } from '../Services.interfaces';

const ConnectionsByService: FC<ConnectionsByServiceProps> = function ({
  serviceId,
  serviceName,
  protocol,
  viewSelected
}) {
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
            <ResourceDistributionFlowChart serviceId={serviceId} serviceName={serviceName} />
          </StackItem>
          <StackItem>
            <FlowPairsService
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

export default ConnectionsByService;
