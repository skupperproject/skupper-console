import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { httpSelectOptions } from '@pages/shared/FlowPair/FlowPair.constants';

import ExposedServers from '../components/ExposedServers';
import FlowPairsServiceTable from '../components/FlowPairsServiceTable';
import Overview from '../components/Overview';
import ResourceDistrubutionFlowChart from '../components/ResourceDistrubutionFlowChart';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, httpColumns, initRequestsQueryParams } from '../Services.constants';
import { RequestsByServiceProps } from '../Services.interfaces';

const HttpService: FC<RequestsByServiceProps> = function ({ serviceId, serviceName, protocol, viewSelected }) {
  return (
    <>
      {viewSelected === TAB_0_KEY && <Overview serviceId={serviceId} protocol={protocol} />}
      {viewSelected === TAB_1_KEY && <ExposedServers serviceId={serviceId} serviceName={serviceName} />}
      {viewSelected === TAB_2_KEY && (
        <Stack hasGutter>
          <StackItem>
            <ResourceDistrubutionFlowChart serviceId={serviceId} serviceName={serviceName} />
          </StackItem>

          <StackItem>
            <FlowPairsServiceTable
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
