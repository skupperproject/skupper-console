import React, { FC } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
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
    Title,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { FlowResponse } from 'API/REST.interfaces';

import { AddressesRoutesPathLabel, AddressesRoutesPaths, FlowLabels } from '../Addresses.enum';
import { QueriesAddresses } from '../services/services.enum';

const FlowsPair = function () {
    const navigate = useNavigate();
    const { address, flowPairId } = useParams();

    const addressId = address?.split('@')[1];
    const addressName = address?.split('@')[0];

    const { data: connection, isLoading: isLoadingConnections } = useQuery(
        [QueriesAddresses.GetFlowPair, flowPairId],
        () => (addressId && flowPairId ? RESTApi.fetchFlowPair(flowPairId as string) : null),
        {
            cacheTime: 0,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        navigate(route);
    }

    if (isLoadingConnections) {
        return <LoadingPage />;
    }

    if (!connection) {
        return null;
    }

    const { forwardFlow, counterFlow } = connection;

    //In the address space a server (counterflow) listen to the port indicated in the name of the address
    const counterFlowWithAddressPort = {
        ...counterFlow,
        sourcePort: addressName?.split(':')[1] as string,
    };

    return (
        <Grid hasGutter data-cy="sk-address">
            <GridItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={AddressesRoutesPaths.Addresses}>
                            {AddressesRoutesPathLabel.Addresses}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link
                            to={`/${AddressesRoutesPathLabel.Addresses}/${address}`}
                        >{`${addressName}`}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{flowPairId}</BreadcrumbHeading>
                </Breadcrumb>
            </GridItem>

            <TextContent>
                <Text component={TextVariants.h4}>
                    Connection {forwardFlow?.endTime ? 'closed' : 'open'}
                </Text>
            </TextContent>
            <GridItem span={6}>
                <Description title={FlowLabels.Flow} flow={forwardFlow} />
            </GridItem>

            <GridItem span={6}>
                <Description
                    title={FlowLabels.CounterFlow}
                    flow={counterFlowWithAddressPort}
                    isCounterflow={true}
                />
            </GridItem>
        </Grid>
    );
};

export default FlowsPair;

interface DescriptionProps {
    title: string;
    flow: FlowResponse;
    isCounterflow?: boolean;
}

const Description: FC<DescriptionProps> = function ({ title, flow, isCounterflow = false }) {
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
                                    {flow.processName}
                                </DescriptionListDescription>
                                <DescriptionListTerm>
                                    {isCounterflow ? FlowLabels.DestHost : FlowLabels.Host}
                                </DescriptionListTerm>
                                <DescriptionListDescription>
                                    {flow.sourceHost}
                                </DescriptionListDescription>
                                <DescriptionListTerm>
                                    {isCounterflow ? FlowLabels.DestPort : FlowLabels.Port}
                                </DescriptionListTerm>
                                <DescriptionListDescription>
                                    {flow.sourcePort}
                                </DescriptionListDescription>
                                <DescriptionListTerm>{FlowLabels.ByteRate}</DescriptionListTerm>
                                <DescriptionListDescription>
                                    {formatByteRate(flow.octetRate)}
                                </DescriptionListDescription>
                                <DescriptionListTerm>
                                    {FlowLabels.BytesTransferred}
                                </DescriptionListTerm>
                                <DescriptionListDescription>
                                    {formatBytes(flow.octets)}
                                </DescriptionListDescription>
                                <DescriptionListTerm>{FlowLabels.ByteUnacked}</DescriptionListTerm>
                                <DescriptionListDescription>
                                    {formatBytes(flow.octetsUnacked)}
                                </DescriptionListDescription>
                                <DescriptionListTerm>{FlowLabels.WindowSize}</DescriptionListTerm>
                                <DescriptionListDescription>
                                    {formatBytes(flow.windowSize)}
                                </DescriptionListDescription>
                                <DescriptionListTerm>{FlowLabels.TTFB}</DescriptionListTerm>
                                <DescriptionListDescription>
                                    {formatTime(flow.latency)}
                                </DescriptionListDescription>
                            </DescriptionListGroup>
                        </GridItem>
                    </Grid>
                </DescriptionList>
            </CardBody>
        </Card>
    );
};
