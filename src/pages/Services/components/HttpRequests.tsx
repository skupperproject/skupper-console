import { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import { httpBiFlowColumns, httpSelectOptions } from '@core/components/SkBiFlowList/BiFlowList.constants';

import ProcessPairsSankeyChart from './ProcessPairsSankey';
import ServiceBiFlowList from './ServiceBiFlowList';
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
        <ServiceBiFlowList
          options={httpSelectOptions}
          columns={httpBiFlowColumns}
          filters={{ ...initRequestsQueryParams, routingKey: name }}
          showAppplicationFlows={true}
        />
      </StackItem>
    </Stack>
  );
};

export default HttpRequests;
