import { FC } from 'react';

import { DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';

import FlowDetailsBase from './FlowDetailsBase';
import { Labels } from '../../../config/labels';
import { TransportFlowResponse } from '../../../types/REST.interfaces';

interface TcpFlowDetailsProps {
  title: string;
  flow: TransportFlowResponse;
  isCounterflow?: boolean;
}

const TcpFlowDetails: FC<TcpFlowDetailsProps> = function ({
  title,
  flow: {
    sourceProcessId,
    destProcessId,
    sourceProcessName,
    destProcessName,
    sourceHost,
    destHost,
    sourcePort,
    destPort,
    proxyHost,
    proxyPort,
    octetCount,
    octetReverseCount,
    latency,
    latencyReverse
  },
  isCounterflow = false
}) {
  const processId = isCounterflow ? destProcessId : sourceProcessId;
  const processName = isCounterflow ? destProcessName : sourceProcessName;
  const host = isCounterflow ? `${destHost} : ${destPort}` : `${sourceHost} : ${sourcePort}`;
  const resolvedProxyHost = isCounterflow ? `${proxyHost} : ${proxyPort}` : undefined;
  const directionalOctetCount = isCounterflow ? octetReverseCount : octetCount;
  const resolvedLatency = isCounterflow ? latencyReverse : latency;

  return (
    <FlowDetailsBase
      title={title}
      processId={processId}
      processName={processName}
      octetCount={directionalOctetCount}
      latency={resolvedLatency}
      isCounterflow={isCounterflow}
      additionalDetails={
        <>
          <DescriptionListTerm>{Labels.Node}</DescriptionListTerm>
          <DescriptionListDescription>{host}</DescriptionListDescription>
          {!!resolvedProxyHost && (
            <>
              <DescriptionListTerm>{Labels.ProxyNode}</DescriptionListTerm>
              <DescriptionListDescription>{resolvedProxyHost}</DescriptionListDescription>
            </>
          )}
        </>
      }
    />
  );
};

export default TcpFlowDetails;
