import React, { FC } from 'react';

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
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { formatByteRate, formatBytes, formatTraceBySites } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { formatTimeInterval } from '@core/utils/formatTimeInterval';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { AvailableProtocols } from 'API/REST.enum';
import { ConnectionTCP, RequestHTTP } from 'API/REST.interfaces';

import { FlowLabels } from '../Addresses.enum';
import { QueriesAddresses } from '../services/services.enum';

const FlowsPair = function () {
  const navigate = useNavigate();
  const { address, flowPairId } = useParams();

  const addressId = address?.split('@')[1];
  const addressName = address?.split('@')[0];

  const { data: flowPair, isLoading: isLoadingFlowPairs } = useQuery(
    [QueriesAddresses.GetFlowPair, flowPairId],
    () => (addressId && flowPairId ? RESTApi.fetchFlowPair(flowPairId as string) : null),
    {
      cacheTime: 0,
      onError: handleError
    }
  );

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    navigate(route);
  }

  if (isLoadingFlowPairs) {
    return <LoadingPage />;
  }

  if (!flowPair) {
    return null;
  }

  const { forwardFlow, counterFlow } = flowPair;

  //In the address space a server (counterflow) listen to the port indicated in the name of the address
  // the sourcePort from the API is internal
  const counterFlowWithAddressPort = {
    ...counterFlow,
    sourcePort: addressName?.split(':')[1] as string
  };

  /**
   *  endTime and startTime are microseconds (because the Apis give us microseconds)
   */
  const duration = formatTimeInterval(flowPair.endTime || Date.now() * 1000, flowPair.startTime);

  return (
    <TransitionPage>
      <Grid hasGutter data-cy="sk-address">
        {flowPair.protocol === AvailableProtocols.Tcp && (
          <>
            <TextContent>
              <Text component={TextVariants.h2}>Connection {forwardFlow?.endTime ? 'closed' : 'open'}</Text>
            </TextContent>

            <Card>
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
              <Text component={TextVariants.h2}>Request {forwardFlow?.endTime ? 'terminated' : 'open'}</Text>
            </TextContent>
            <Card>
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

        <GridItem span={6}>
          {flowPair.protocol === AvailableProtocols.Tcp ? (
            <ConnectionDetail title={FlowLabels.Flow} flow={forwardFlow} />
          ) : (
            <RequestDetail title={FlowLabels.Flow} flow={forwardFlow} />
          )}
        </GridItem>

        <GridItem span={6}>
          {flowPair.protocol === AvailableProtocols.Tcp ? (
            <ConnectionDetail title={FlowLabels.CounterFlow} flow={counterFlowWithAddressPort} isCounterflow={true} />
          ) : (
            <RequestDetail title={FlowLabels.CounterFlow} flow={counterFlowWithAddressPort} isCounterflow={true} />
          )}
        </GridItem>
      </Grid>
    </TransitionPage>
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
    <Card isFullHeight isRounded>
      <CardTitle>
        <Title headingLevel="h2">{title}</Title>
      </CardTitle>
      <CardBody>
        <DescriptionList>
          <Grid hasGutter>
            <GridItem span={6}>
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
                {!!flow.octetRate && (
                  <>
                    <DescriptionListTerm>{FlowLabels.ByteRate}</DescriptionListTerm>
                    <DescriptionListDescription>{formatByteRate(flow.octetRate)}</DescriptionListDescription>
                  </>
                )}
                <DescriptionListTerm>{FlowLabels.BytesTransferred}</DescriptionListTerm>
                <DescriptionListDescription>{formatBytes(flow.octets)}</DescriptionListDescription>
                <DescriptionListTerm>{FlowLabels.ByteUnacked}</DescriptionListTerm>
                <DescriptionListDescription>{formatBytes(flow.octetsUnacked)}</DescriptionListDescription>
                <DescriptionListTerm>{FlowLabels.WindowSize}</DescriptionListTerm>
                <DescriptionListDescription>{formatBytes(flow.windowSize)}</DescriptionListDescription>
                <DescriptionListTerm>{FlowLabels.Latency}</DescriptionListTerm>
                <DescriptionListDescription>{formatLatency(flow.latency)}</DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>
          </Grid>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

const RequestDetail: FC<DescriptionProps> = function ({ title, flow }) {
  return (
    <Card isFullHeight isRounded>
      <CardTitle>
        <Title headingLevel="h2">{title}</Title>
      </CardTitle>
      <CardBody>
        <DescriptionList>
          <Grid hasGutter>
            <GridItem span={6}>
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
                {!!flow.octetRate && (
                  <>
                    <DescriptionListTerm>{FlowLabels.ByteRate}</DescriptionListTerm>
                    <DescriptionListDescription>{formatByteRate(flow.octetRate)}</DescriptionListDescription>
                  </>
                )}
                <DescriptionListTerm>{FlowLabels.BytesTransferred}</DescriptionListTerm>
                <DescriptionListDescription>{formatBytes(flow.octets)}</DescriptionListDescription>
                <DescriptionListTerm>{FlowLabels.Latency}</DescriptionListTerm>
                <DescriptionListDescription>{formatLatency(flow.latency)}</DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>
          </Grid>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
