import { FC } from 'react';

import ServiceBiFlowList from './ServiceBiFlowList';
import { httpBiFlowColumns, httpSelectOptions } from '../../../core/components/SkBiFlowList/BiFlowList.constants';
import { initRequestsQueryParams } from '../Services.constants';

interface HttpRequestsProps {
  routingKey: string;
}

const HttpRequests: FC<HttpRequestsProps> = function ({ routingKey }) {
  return (
    <ServiceBiFlowList
      options={httpSelectOptions}
      columns={httpBiFlowColumns}
      filters={{ ...initRequestsQueryParams, routingKey }}
      showAppplicationFlows={true}
    />
  );
};

export default HttpRequests;
