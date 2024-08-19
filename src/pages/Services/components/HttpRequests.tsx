import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { AvailableProtocols } from '@API/REST.enum';
import { httpSelectOptions } from '@core/components/SkFlowPairsTable/FlowPair.constants';

import ExposedServers from './ExposedServers';
import FlowPairsTable from './FlowPairsTable';
import Overview from './Overview';
import ProcessPairsSankeyChart from './ProcessPairsSankey';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, httpColumns, initRequestsQueryParams } from '../Services.constants';

interface HttpRequestsProps {
  serviceId: string;
  serviceName: string;
  protocol: AvailableProtocols;
  viewSelected: string;
}

const HttpRequests: FC<HttpRequestsProps> = function ({ serviceId, serviceName, protocol, viewSelected }) {
  return (
    <>
      {viewSelected === TAB_0_KEY && <Overview serviceId={serviceId} serviceName={serviceName} protocol={protocol} />}
      {viewSelected === TAB_1_KEY && <ExposedServers serviceId={serviceId} serviceName={serviceName} />}
      {viewSelected === TAB_2_KEY && (
        <Stack hasGutter>
          <StackItem>
            <ProcessPairsSankeyChart serviceId={serviceId} serviceName={serviceName} />
          </StackItem>
          <StackItem>
            <FlowPairsTable
              serviceId={serviceId}
              options={httpSelectOptions}
              columns={httpColumns}
              filters={initRequestsQueryParams}
            />
          </StackItem>
        </Stack>
      )}
    </>
  );
};

export default HttpRequests;
