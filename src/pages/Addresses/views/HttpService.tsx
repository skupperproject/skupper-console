import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { httpSelectOptions } from '@pages/shared/FlowPair/FlowPair.constants';

import ExposedServers from '../components/ExposedServers';
import FlowPairsServiceTable from '../components/FlowPairsServiceTable';
import Overview from '../components/Overview';
import ResourceDistrubutionFlowChart from '../components/ResourceDistrubutionFlowChart';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, httpColumns, initRequestsQueryParams } from '../Services.constants';
import { RequestsByAddressProps } from '../Services.interfaces';

const HttpService: FC<RequestsByAddressProps> = function ({ addressId, addressName, protocol, viewSelected }) {
  return (
    <>
      {viewSelected === TAB_0_KEY && <Overview addressId={addressId} protocol={protocol} />}
      {viewSelected === TAB_1_KEY && <ExposedServers addressId={addressId} addressName={addressName} />}
      {viewSelected === TAB_2_KEY && (
        <Stack hasGutter>
          <StackItem>
            <ResourceDistrubutionFlowChart addressId={addressId} addressName={addressName} />
          </StackItem>

          <StackItem>
            <FlowPairsServiceTable
              addressId={addressId}
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
