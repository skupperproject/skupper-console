import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { httpSelectOptions } from '@pages/shared/FlowPairs/FlowPair.constants';

import ExposedServers from '../components/ExposedServers';
import FlowPairsService from '../components/FlowPairsService';
import Overview from '../components/Overview';
import ResourceDistrubutionFlowChart from '../components/ResourceDistrubutionFlowChart';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, httpColumns, initRequestsQueryParams } from '../Services.constants';
import { RequestsByServiceProps } from '../Services.interfaces';

const HttpService: FC<RequestsByServiceProps> = function ({ serviceId, serviceName, protocol, viewSelected }) {
  return (
    <>
      {viewSelected === TAB_0_KEY && (
        <Stack hasGutter>
          <StackItem>
            <ResourceDistrubutionFlowChart serviceId={serviceId} serviceName={serviceName} />
          </StackItem>

          <StackItem />
          <Overview serviceId={serviceId} protocol={protocol} />
        </Stack>
      )}
      {viewSelected === TAB_1_KEY && <ExposedServers serviceId={serviceId} serviceName={serviceName} />}
      {viewSelected === TAB_2_KEY && (
        <FlowPairsService
          serviceId={serviceId}
          options={httpSelectOptions}
          columns={httpColumns}
          filters={initRequestsQueryParams}
        />
      )}
    </>
  );
};

export default HttpService;
