import { FC } from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';
import { LaptopIcon, LongArrowAltDownIcon, LongArrowAltUpIcon, ServerIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

import { AvailableProtocols } from '@API/REST.enum';
import { ConnectionTCP, FlowPairsResponse, RequestHTTP } from '@API/REST.interfaces';
import { getTestsIds } from '@config/testIds.config';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatBytes, formatTraceBySites } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { formatTimeInterval } from '@core/utils/formatTimeInterval';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import { FlowLabels } from './FlowPairs.enum';

const FlowsPair: FC<{ flowPair: FlowPairsResponse | undefined }> = function ({ flowPair }) {
  if (!flowPair) {
    return null;
  }

  const { forwardFlow, counterFlow } = flowPair;

  /**
   *  endTime and startTime are microseconds (because the Apis give us microseconds)
   */
  const duration = formatTimeInterval(flowPair.endTime || Date.now() * 1000, flowPair.startTime);

  return (
    <Grid hasGutter data-testid={getTestsIds.flowPairsView(flowPair.identity)}>
      <GridItem>
        {flowPair.protocol === AvailableProtocols.Tcp && (
          <>
            <TextContent>
              <Text component={TextVariants.h2}>Connection {flowPair.endTime ? 'closed' : 'open'}</Text>
            </TextContent>

            <Card isPlain>
              <CardBody>
                <DescriptionList>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{FlowLabels.Trace}</DescriptionListTerm>
                    <DescriptionListDescription>{formatTraceBySites(flowPair.flowTrace)}</DescriptionListDescription>
                    {duration && (
                      <>
                        <DescriptionListTerm>{FlowLabels.Duration}</DescriptionListTerm>
                        <DescriptionListDescription>{duration}</DescriptionListDescription>
                      </>
                    )}
                  </DescriptionListGroup>
                </DescriptionList>
              </CardBody>
            </Card>
          </>
        )}
        {flowPair.protocol !== AvailableProtocols.Tcp && (
          <>
            <TextContent>
              <Text component={TextVariants.h2}>Request {flowPair.endTime ? 'terminated' : 'open'}</Text>
            </TextContent>
            <Card isPlain>
              <CardBody>
                <DescriptionList>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{FlowLabels.Protocol}</DescriptionListTerm>
                    <DescriptionListDescription>{forwardFlow.protocol}</DescriptionListDescription>
                    <DescriptionListTerm>{FlowLabels.Method}</DescriptionListTerm>
                    <DescriptionListDescription>{forwardFlow.method}</DescriptionListDescription>
                    <DescriptionListTerm>{FlowLabels.Trace}</DescriptionListTerm>
                    <DescriptionListDescription>{formatTraceBySites(flowPair.flowTrace)}</DescriptionListDescription>
                    {duration && (
                      <>
                        <DescriptionListTerm>{FlowLabels.Duration}</DescriptionListTerm>
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

      <GridItem>
        <Flex direction={{ default: 'column', md: 'row' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
            {flowPair.protocol === AvailableProtocols.Tcp ? (
              <ConnectionDetail title={FlowLabels.Flow} flow={forwardFlow} />
            ) : (
              <RequestDetail title={FlowLabels.Flow} flow={forwardFlow} />
            )}
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
            {flowPair.protocol === AvailableProtocols.Tcp ? (
              <ConnectionDetail title={FlowLabels.CounterFlow} flow={counterFlow} isCounterflow={true} />
            ) : (
              <RequestDetail title={FlowLabels.CounterFlow} flow={counterFlow} isCounterflow={true} />
            )}
          </FlexItem>
        </Flex>
      </GridItem>
    </Grid>
  );
};

export default FlowsPair;

interface DescriptionProps {
  title: string;
  flow: ConnectionTCP & RequestHTTP;
  isCounterflow?: boolean;
}

const ConnectionDetail: FC<DescriptionProps> = function ({ title, flow, isCounterflow = false }) {
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
            <DescriptionListTerm>{FlowLabels.Process}</DescriptionListTerm>
            <DescriptionListDescription>
              <>
                {<ResourceIcon type="process" />}
                <Link to={`${ProcessesRoutesPaths.Processes}/${flow.processName}@${flow.process}`}>
                  {flow.processName}
                </Link>
              </>
            </DescriptionListDescription>
            <DescriptionListTerm>{isCounterflow ? FlowLabels.DestHost : FlowLabels.Host}</DescriptionListTerm>
            <DescriptionListDescription>{flow.sourceHost}</DescriptionListDescription>
            <DescriptionListTerm>{isCounterflow ? FlowLabels.DestPort : FlowLabels.Port}</DescriptionListTerm>
            <DescriptionListDescription>{flow.sourcePort}</DescriptionListDescription>
            <DescriptionListTerm>{FlowLabels.BytesTransferred}</DescriptionListTerm>
            <DescriptionListDescription>
              {formatBytes(flow.octets)}{' '}
              <Icon>
                {' '}
                {isCounterflow ? (
                  <LongArrowAltDownIcon color="var(--pf-v5-global--palette--blue-300)" />
                ) : (
                  <LongArrowAltUpIcon color="var(--pf-v5-global--palette--green-400)" />
                )}
              </Icon>
            </DescriptionListDescription>
            <DescriptionListTerm>{FlowLabels.ByteUnacked}</DescriptionListTerm>
            <DescriptionListDescription>{formatBytes(flow.octetsUnacked)}</DescriptionListDescription>
            <DescriptionListTerm>{FlowLabels.WindowSize}</DescriptionListTerm>
            <DescriptionListDescription>{formatBytes(flow.windowSize)}</DescriptionListDescription>
            <DescriptionListTerm>{FlowLabels.Latency}</DescriptionListTerm>
            <DescriptionListDescription>{formatLatency(flow.latency)}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

const RequestDetail: FC<DescriptionProps> = function ({ title, flow, isCounterflow }) {
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
            <DescriptionListTerm>{FlowLabels.Process}</DescriptionListTerm>
            <DescriptionListDescription>
              <>
                {<ResourceIcon type="process" />}
                <Link to={`${ProcessesRoutesPaths.Processes}/${flow.processName}@${flow.process}`}>
                  {flow.processName}
                </Link>
              </>
            </DescriptionListDescription>
            <DescriptionListTerm>{FlowLabels.BytesTransferred}</DescriptionListTerm>
            <DescriptionListDescription>
              {formatBytes(flow.octets)}
              <Icon>
                {' '}
                {isCounterflow ? (
                  <LongArrowAltDownIcon color="var(--pf-v5-global--palette--blue-300)" />
                ) : (
                  <LongArrowAltUpIcon color="var(-v5-global--palette--green-400)" />
                )}
              </Icon>
            </DescriptionListDescription>{' '}
            <DescriptionListTerm>{FlowLabels.Latency}</DescriptionListTerm>
            <DescriptionListDescription>{formatLatency(flow.latency)}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
