import { FC } from 'react';

import { httpBiFlowColumns, httpSelectOptions } from '../../../core/components/SkBiFlowList/BiFlowList.constants';
import BiFlowLogs from '../../shared/BiFlowLogs';
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
