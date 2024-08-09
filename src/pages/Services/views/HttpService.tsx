import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { AvailableProtocols } from '@API/REST.enum';
import { httpSelectOptions } from '@pages/shared/FlowPairs/FlowPair.constants';

import ExposedServers from '../components/ExposedServers';
import FlowPairsService from '../components/FlowPairsService';
import Overview from '../components/Overview';
import ResourceDistributionFlowChart from '../components/ResourceDistrubutionFlowChart';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, httpColumns, initRequestsQueryParams } from '../Services.constants';

interface RequestsByServiceProps {
  serviceId: string;
  serviceName: string;
  protocol: AvailableProtocols;
  viewSelected: string;
}

const HttpService: FC<RequestsByServiceProps> = function ({ serviceId, serviceName, protocol, viewSelected }) {
  return (
    <>
      {viewSelected === TAB_0_KEY && <Overview serviceId={serviceId} serviceName={serviceName} protocol={protocol} />}
      {viewSelected === TAB_1_KEY && <ExposedServers serviceId={serviceId} serviceName={serviceName} />}
      {viewSelected === TAB_2_KEY && (
        <Stack hasGutter>
          <StackItem>
            <ResourceDistributionFlowChart serviceId={serviceId} serviceName={serviceName} />
          </StackItem>
          <StackItem>
            <FlowPairsService
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

export default HttpService;
