import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { httpFlowPairsColumns, httpSelectOptions } from '@core/components/SkFlowPairsList/FlowPairs.constants';

import FlowPairsTable from './FlowPairsTable';
import ProcessPairsSankeyChart from './ProcessPairsSankey';
import { initRequestsQueryParams } from '../Services.constants';

interface HttpRequestsProps {
  id: string;
  name: string;
}

const HttpRequests: FC<HttpRequestsProps> = function ({ id, name }) {
  return (
    <Stack hasGutter>
      <StackItem>
        <ProcessPairsSankeyChart serviceId={id} serviceName={name} />
      </StackItem>
      <StackItem>
        <FlowPairsTable
          options={httpSelectOptions}
          columns={httpFlowPairsColumns}
          filters={{ ...initRequestsQueryParams, routingKey: name }}
        />
      </StackItem>
    </Stack>
  );
};

export default HttpRequests;
