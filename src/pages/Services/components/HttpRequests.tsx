import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { httpSelectOptions } from '@core/components/SkFlowPairsTable/FlowPair.constants';

import ExposedServers from './ExposedServers';
import FlowPairsTable from './FlowPairsTable';
import Overview from './Overview';
import ProcessPairsSankeyChart from './ProcessPairsSankey';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, httpColumns, initRequestsQueryParams } from '../Services.constants';

interface HttpRequestsProps {
  id: string;
  name: string;
  viewSelected: string;
}

const HttpRequests: FC<HttpRequestsProps> = function ({ id, name, viewSelected }) {
  return (
    <>
      {viewSelected === TAB_0_KEY && <Overview id={id} name={name} />}
      {viewSelected === TAB_1_KEY && <ExposedServers serviceId={id} serviceName={name} />}
      {viewSelected === TAB_2_KEY && (
        <Stack hasGutter>
          <StackItem>
            <ProcessPairsSankeyChart serviceId={id} serviceName={name} />
          </StackItem>
          <StackItem>
            <FlowPairsTable
              options={httpSelectOptions}
              columns={httpColumns}
              filters={{ ...initRequestsQueryParams, routingKey: name }}
            />
          </StackItem>
        </Stack>
      )}
    </>
  );
};

export default HttpRequests;
