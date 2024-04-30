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
import { ConnectionTCP, FlowPairsResponse, RequestHTTP } from '@API/REST.interfaces';
import { getTestsIds } from '@config/testIds';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { formatTimeInterval } from '@core/utils/formatTimeInterval';
import { formatTraceBySites } from '@core/utils/formatTrace';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import { FlowPairLabels } from './FlowPair.enum';

const FlowPair: FC<{ flowPair: FlowPairsResponse }> = function ({ flowPair }) {
  const {
    forwardFlow,
    counterFlow,
    protocol,
    endTime: endTimeMicroSeconds,
    startTime: startTimeMicroSenconds,
    identity,
    flowTrace
  } = flowPair;

  const duration = formatTimeInterval(endTimeMicroSeconds || Date.now() * 1000, startTimeMicroSenconds);

  const isHtpp = protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2;

  return (
    <Grid hasGutter data-testid={getTestsIds.flowPairsView(identity)}>
      <GridItem span={12}>
        {!isHtpp && (
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
                    <DescriptionListDescription>{formatTraceBySites(flowTrace) || '-'}</DescriptionListDescription>
                    {duration && (
                      <>
                        <DescriptionListTerm>{FlowPairLabels.Duration}</DescriptionListTerm>
                        <DescriptionListDescription>{duration}</DescriptionListDescription>
                      </>
                    )}
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </>
        )}
        {isHtpp && (
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
                    <DescriptionListTerm>{FlowPairLabels.Method}</DescriptionListTerm>
                    <DescriptionListDescription>{forwardFlow.method}</DescriptionListDescription>
                    <DescriptionListTerm>{FlowPairLabels.Status}</DescriptionListTerm>
                    <DescriptionListDescription>{forwardFlow.result || counterFlow.result}</DescriptionListDescription>
                    <DescriptionListTerm>{FlowPairLabels.Trace}</DescriptionListTerm>
                    <DescriptionListDescription>{formatTraceBySites(flowTrace)}</DescriptionListDescription>
                    {duration && (
                      <>
                        <DescriptionListTerm>{FlowPairLabels.Duration}</DescriptionListTerm>
                        <DescriptionListDescription>{duration}</DescriptionListDescription>
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
          <ConnectionDetail title={FlowPairLabels.Flow} flow={forwardFlow} />
        ) : (
          <RequestDetail title={FlowPairLabels.Flow} flow={forwardFlow} />
        )}
      </GridItem>
      <GridItem span={6}>
        {flowPair.protocol === AvailableProtocols.Tcp ? (
          <ConnectionDetail title={FlowPairLabels.CounterFlow} flow={counterFlow} isCounterflow={true} />
        ) : (
          <RequestDetail title={FlowPairLabels.CounterFlow} flow={counterFlow} isCounterflow={true} />
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

const ConnectionDetail: FC<DescriptionProps<ConnectionTCP>> = function ({ title, flow, isCounterflow = false }) {
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
                <Link to={`${ProcessesRoutesPaths.Processes}/${flow.processName}@${flow.process}`}>
                  {flow.processName}
                </Link>
              </>
            </DescriptionListDescription>
            <DescriptionListTerm>{FlowPairLabels.Host}</DescriptionListTerm>
            <DescriptionListDescription>{flow.sourceHost}</DescriptionListDescription>
            <DescriptionListTerm>{FlowPairLabels.Port}</DescriptionListTerm>
            <DescriptionListDescription>{flow.sourcePort}</DescriptionListDescription>
            <DescriptionListTerm>{FlowPairLabels.BytesTransferred}</DescriptionListTerm>
            <DescriptionListDescription>{formatBytes(flow.octets)} </DescriptionListDescription>
            <DescriptionListTerm>{FlowPairLabels.ByteUnacked}</DescriptionListTerm>
            <DescriptionListDescription>{formatBytes(flow.octetsUnacked)}</DescriptionListDescription>
            <DescriptionListTerm>{FlowPairLabels.WindowSize}</DescriptionListTerm>
            <DescriptionListDescription>{formatBytes(flow.windowSize)}</DescriptionListDescription>
            <DescriptionListTerm>{FlowPairLabels.Latency}</DescriptionListTerm>
            <DescriptionListDescription>{formatLatency(flow.latency)}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

const RequestDetail: FC<DescriptionProps<RequestHTTP>> = function ({ title, flow, isCounterflow }) {
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
                <Link to={`${ProcessesRoutesPaths.Processes}/${flow.processName}@${flow.process}`}>
                  {flow.processName}
                </Link>
              </>
            </DescriptionListDescription>
            <DescriptionListTerm>{FlowPairLabels.BytesTransferred}</DescriptionListTerm>
            <DescriptionListDescription>{formatBytes(flow.octets)}</DescriptionListDescription>{' '}
            <DescriptionListTerm>{FlowPairLabels.Latency}</DescriptionListTerm>
            <DescriptionListDescription>{formatLatency(flow.latency)}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
