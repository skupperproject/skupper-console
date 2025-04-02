import { FC } from 'react';

import BiFlowLogs from '../../../core/components/BiFlowLogs';
import { httpBiFlowColumns, httpSelectOptions } from '../../../core/components/SkBiFlowList/BiFlowList.constants';
import { initRequestsQueryParams } from '../Services.constants';

interface HttpRequestsProps {
  routingKey: string;
}

const HttpRequests: FC<HttpRequestsProps> = function ({ routingKey }) {
  return (
    <BiFlowLogs
      options={httpSelectOptions}
      columns={httpBiFlowColumns}
      filters={{ ...initRequestsQueryParams, routingKey }}
      showAppplicationFlows={true}
    />
  );
};

export default HttpRequests;
