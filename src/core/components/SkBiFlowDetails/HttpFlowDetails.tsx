import { FC } from 'react';

import { DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';

import { HttpBiflow } from '@sk-types/REST.interfaces';

import { BiFlowLabels } from './BiFlow.enum';
import FlowDetailsBase from './FlowDetailsBase';

interface HttpFlowDetailsProps {
  title: string;
  flow: HttpBiflow;
  isCounterflow?: boolean;
}

const HttpFlowDetails: FC<HttpFlowDetailsProps> = function ({
  title,
  flow: {
    sourceProcessId,
    destProcessId,
    sourceProcessName,
    destProcessName,
    octets,
    octetsReverse,
    latency,
    latencyReverse,
    forwardFlow,
    counterFlow
  },
  isCounterflow = false
}) {
  const processId = isCounterflow ? sourceProcessId : destProcessId;
  const processName = isCounterflow ? sourceProcessName : destProcessName;
  const octetsResolved = isCounterflow ? octets : octetsReverse;
  const latencyResolved = isCounterflow ? latency : latencyReverse;
  const methodResolved = isCounterflow ? '' : forwardFlow.method;
  const resultResolved = isCounterflow ? counterFlow.result : '';

  return (
    <FlowDetailsBase
      title={title}
      processId={processId}
      processName={processName}
      octets={octetsResolved}
      latency={latencyResolved}
      isCounterflow={isCounterflow}
      additionalDetails={
        <>
          {methodResolved && (
            <>
              <DescriptionListTerm>{BiFlowLabels.Method}</DescriptionListTerm>
              <DescriptionListDescription>{methodResolved}</DescriptionListDescription>
            </>
          )}
          {resultResolved && (
            <>
              <DescriptionListTerm>{BiFlowLabels.Status}</DescriptionListTerm>
              <DescriptionListDescription>{resultResolved}</DescriptionListDescription>
            </>
          )}
        </>
      }
    />
  );
};

export default HttpFlowDetails;
