import { FC } from 'react';

import { DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';

import FlowDetailsBase from './FlowDetailsBase';
import { Labels } from '../../../config/labels';
import { ApplicationFlowResponse } from '../../../types/REST.interfaces';

interface HttpFlowDetailsProps {
  title: string;
  flow: ApplicationFlowResponse;
  isCounterflow?: boolean;
}

const HttpFlowDetails: FC<HttpFlowDetailsProps> = function ({
  title,
  flow: { sourceProcessId, destProcessId, sourceProcessName, destProcessName, octets, octetsReverse, method, status },
  isCounterflow = false
}) {
  const processId = isCounterflow ? sourceProcessId : destProcessId;
  const processName = isCounterflow ? sourceProcessName : destProcessName;
  const octetsResolved = isCounterflow ? octets : octetsReverse;
  const methodResolved = isCounterflow ? '' : method;
  const resultResolved = isCounterflow ? status : '';

  return (
    <FlowDetailsBase
      title={title}
      processId={processId}
      processName={processName}
      octets={octetsResolved}
      isCounterflow={isCounterflow}
      additionalDetails={
        <>
          {methodResolved && (
            <>
              <DescriptionListTerm>{Labels.Method}</DescriptionListTerm>
              <DescriptionListDescription>{methodResolved}</DescriptionListDescription>
            </>
          )}
          {resultResolved && (
            <>
              <DescriptionListTerm>{Labels.Status}</DescriptionListTerm>
              <DescriptionListDescription>{resultResolved}</DescriptionListDescription>
            </>
          )}
        </>
      }
    />
  );
};

export default HttpFlowDetails;
