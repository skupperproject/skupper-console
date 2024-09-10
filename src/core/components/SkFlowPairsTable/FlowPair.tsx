import { FC } from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Icon,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';
import { LaptopIcon, ServerIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

import { AvailableProtocols } from '@API/REST.enum';
import { getTestsIds } from '@config/testIds';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { formatTraceBySites } from '@core/utils/formatTrace';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { TcpBiflow, FlowPairsResponse, HttpBiflow } from '@sk-types/REST.interfaces';

import { FlowPairLabels } from './FlowPair.enum';

interface FlowPairProps {
  flowPair: FlowPairsResponse;
}

const FlowPair: FC<FlowPairProps> = function ({ flowPair }) {
  const { protocol, endTime: endTimeMicroSeconds, identity, traceSites, duration } = flowPair;

  const hasHttp = protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2;

  return (
    <Grid hasGutter data-testid={getTestsIds.flowPairsView(identity)}>
      <GridItem span={12}>
        <>
          <TextContent>
            <Text component={TextVariants.h2}>
              Connection {endTimeMicroSeconds ? FlowPairLabels.FlowPairClosed : FlowPairLabels.FlowPairOpen}
            </Text>
          </TextContent>

          <Card isPlain>
            <CardBody>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>{FlowPairLabels.Trace}</DescriptionListTerm>
                  <DescriptionListDescription>{formatTraceBySites(traceSites) || '-'}</DescriptionListDescription>
                  {!!duration && (
                    <>
                      <DescriptionListTerm>{FlowPairLabels.Duration}</DescriptionListTerm>
                      <DescriptionListDescription>{formatLatency(duration)}</DescriptionListDescription>
                    </>
                  )}
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </>
        {hasHttp && (
          <>
            <TextContent>
              <Text component={TextVariants.h2}>
                Request {endTimeMicroSeconds ? FlowPairLabels.FlowPairTerminated : FlowPairLabels.FlowPairOpen}
              </Text>
            </TextContent>
            <Card isPlain>
              <CardBody>
                <DescriptionList>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{FlowPairLabels.Protocol}</DescriptionListTerm>
                    <DescriptionListDescription>{protocol}</DescriptionListDescription>

                    <DescriptionListTerm>{FlowPairLabels.Trace}</DescriptionListTerm>
                    <DescriptionListDescription>{formatTraceBySites(traceSites)}</DescriptionListDescription>
                    {!!duration && (
                      <>
                        <DescriptionListTerm>{FlowPairLabels.Duration}</DescriptionListTerm>
                        <DescriptionListDescription>{formatLatency(duration)}</DescriptionListDescription>
                      </>
                    )}
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </>
        )}
      </GridItem>

      <GridItem span={6}>
        {flowPair.protocol === AvailableProtocols.Tcp ? (
          <ConnectionDetail title={FlowPairLabels.Flow} flow={flowPair as TcpBiflow} />
        ) : (
          <RequestDetail title={FlowPairLabels.Flow} flow={flowPair as HttpBiflow} />
        )}
      </GridItem>
      <GridItem span={6}>
        {flowPair.protocol === AvailableProtocols.Tcp ? (
          <ConnectionDetail title={FlowPairLabels.CounterFlow} flow={flowPair as TcpBiflow} isCounterflow={true} />
        ) : (
          <RequestDetail title={FlowPairLabels.CounterFlow} flow={flowPair as HttpBiflow} isCounterflow={true} />
        )}
      </GridItem>
    </Grid>
  );
};

export default FlowPair;

interface DescriptionProps<T> {
  title: string;
  flow: T;
  isCounterflow?: boolean;
}

const ConnectionDetail: FC<DescriptionProps<TcpBiflow>> = function ({ title, flow, isCounterflow = false }) {
  const processId = isCounterflow ? flow.sourceProcessId : flow.destProcessId;
  const processName = isCounterflow ? flow.sourceProcessName : flow.destProcessName;
  const host = isCounterflow ? `${flow.destHost} : ${flow.destPort}` : `${flow.sourceHost} : ${flow.sourcePort}`;
  const proxyHost = isCounterflow ? `${flow.proxyHost} : ${flow.proxyPort}` : undefined;
  const octets = isCounterflow ? flow.octets : flow.octetsReverse;
  const latency = isCounterflow ? flow.latency : flow.latencyReverse;

  return (
    <Card isFullHeight isPlain>
      <CardTitle>
        <Title headingLevel="h2">
          {' '}
          <Icon isInline size="md">
            {isCounterflow ? <ServerIcon /> : <LaptopIcon />}
          </Icon>
          {'  '}
          {title}
        </Title>
      </CardTitle>
      <CardBody>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>{FlowPairLabels.Process}</DescriptionListTerm>
            <DescriptionListDescription>
              <>
                {<ResourceIcon type="process" />}
                <Link to={`${ProcessesRoutesPaths.Processes}/${processName}@${processId}`}>{processName}</Link>
              </>
            </DescriptionListDescription>
            <DescriptionListTerm>{FlowPairLabels.BytesTransferred}</DescriptionListTerm>
            <DescriptionListDescription>{octets} </DescriptionListDescription>
            <DescriptionListTerm>{FlowPairLabels.Latency}</DescriptionListTerm>
            <DescriptionListDescription>{formatLatency(latency)}</DescriptionListDescription>
            <DescriptionListTerm>{FlowPairLabels.Host}</DescriptionListTerm>
            <DescriptionListDescription>{host}</DescriptionListDescription>
            {proxyHost && <DescriptionListTerm>{FlowPairLabels.ProxyHost}</DescriptionListTerm>}
            {proxyHost && <DescriptionListDescription>{proxyHost}</DescriptionListDescription>}
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

const RequestDetail: FC<DescriptionProps<HttpBiflow>> = function ({ title, flow, isCounterflow }) {
  const processId = isCounterflow ? flow.sourceProcessId : flow.destProcessId;
  const processName = isCounterflow ? flow.sourceProcessName : flow.destProcessName;
  const octets = isCounterflow ? flow.octets : flow.octetsReverse;
  const latency = isCounterflow ? flow.latency : flow.latencyReverse;
  const method = isCounterflow ? '' : flow.forwardFlow.method;
  const result = isCounterflow ? flow.counterFlow.result : '';

  return (
    <Card isFullHeight isPlain>
      <CardTitle>
        <Title headingLevel="h2">
          {' '}
          <Icon isInline size="md">
            {isCounterflow ? <ServerIcon /> : <LaptopIcon />}
          </Icon>
          {'  '}
          {title}
        </Title>
      </CardTitle>
      <CardBody>
        <DescriptionList isAutoFit>
          <DescriptionListGroup>
            <DescriptionListTerm>{FlowPairLabels.Process}</DescriptionListTerm>
            <DescriptionListDescription>
              <>
                {<ResourceIcon type="process" />}
                <Link to={`${ProcessesRoutesPaths.Processes}/${processName}@${processId}`}>{processName}</Link>
              </>
            </DescriptionListDescription>
            {method && (
              <>
                <DescriptionListTerm>{FlowPairLabels.Method}</DescriptionListTerm>
                <DescriptionListDescription>{method}</DescriptionListDescription>
              </>
            )}
            {result && (
              <>
                <DescriptionListTerm>{FlowPairLabels.Status}</DescriptionListTerm>
                <DescriptionListDescription>
                  {flow.forwardFlow.result || flow.counterFlow.result}
                </DescriptionListDescription>
              </>
            )}
            <DescriptionListTerm>{FlowPairLabels.BytesTransferred}</DescriptionListTerm>
            <DescriptionListDescription>{formatBytes(octets)}</DescriptionListDescription>{' '}
            <DescriptionListTerm>{FlowPairLabels.Latency}</DescriptionListTerm>
            <DescriptionListDescription>{formatLatency(latency)}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
