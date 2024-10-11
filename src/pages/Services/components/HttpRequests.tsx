import { FC } from 'react';

import { httpBiFlowColumns, httpSelectOptions } from '@core/components/SkBiFlowList/BiFlowList.constants';

import ServiceBiFlowList from './ServiceBiFlowList';
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
