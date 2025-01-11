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
    octets,
    octetsReverse,
    latency,
    latencyReverse
  },
  isCounterflow = false
}) {
  const processId = isCounterflow ? destProcessId : sourceProcessId;
  const processName = isCounterflow ? destProcessName : sourceProcessName;
  const host = isCounterflow ? `${destHost} : ${destPort}` : `${sourceHost} : ${sourcePort}`;
  const resolvedProxyHost = isCounterflow ? `${proxyHost} : ${proxyPort}` : undefined;
  const transferredOctets = isCounterflow ? octetsReverse : octets;
  const resolvedLatency = isCounterflow ? latencyReverse : latency;

  return (
    <FlowDetailsBase
      title={title}
      processId={processId}
      processName={processName}
      octets={transferredOctets}
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
