import React, { useState } from 'react';

import { ChartPie } from '@patternfly/react-charts';
import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardBody,
    CardTitle,
    Flex,
    Grid,
    GridItem,
    Text,
    TextContent,
    TextVariants,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { FlowPairsLabels, AddressesRoutesPathLabel, AddressesRoutesPaths } from '../Addresses.enum';
import FlowsPairsTable from '../components/FlowPairsTable';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const REAL_TIME_CONNECTION_HEIGHT_CHART = 350;
const ITEM_DISPLAY_COUNT = 6;

const FlowsPairs = function () {
    const navigate = useNavigate();
    const { id: address } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const addressId = address?.split('@')[1];
    const addressName = address?.split('@')[0];

    const { data: connections, isLoading: isLoadingConnections } = useQuery(
        [QueriesAddresses.GetFlowPairsByAddress, addressId],
        () => (addressId ? AddressesController.getFlowPairsByAddress(addressId) : null),
        {
            cacheTime: 0,
            refetchInterval,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    if (isLoadingConnections) {
        return <LoadingPage />;
    }

    if (!connections) {
        return null;
    }

    const topClientsMap = connections.reduce((acc, { processId, processName, bytes }, index) => {
        if (index < ITEM_DISPLAY_COUNT) {
            acc[processName] = { name: processName, value: (acc[processId]?.value || 0) + bytes };
        }

        return acc;
    }, {} as Record<string, { name: string; value: number }>);
    const topClients = Object.values(topClientsMap);

    const totalBytesSent = connections.reduce((acc, { bytes }) => acc + bytes, 0);
    const totalBytesReceived = connections.reduce((acc, { targetBytes }) => acc + targetBytes, 0);

    const AvgByteRateSent = Math.round(
        connections.reduce((acc, { byteRate }) => acc + byteRate, 0) / (connections.length || 1),
    );

    const AvgByteRateReceived = Math.round(
        connections.reduce((acc, { targetByteRate }) => acc + targetByteRate, 0) /
            (connections.length || 1),
    );

    return (
        <Grid hasGutter data-cy="sk-address">
            <GridItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={AddressesRoutesPaths.Addresses}>
                            {AddressesRoutesPathLabel.Addresses}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{addressName}</BreadcrumbHeading>
                </Breadcrumb>
            </GridItem>

            <GridItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <ResourceIcon type="address" />
                    <TextContent>
                        <Text component={TextVariants.h1}>{addressName}</Text>
                    </TextContent>
                </Flex>
            </GridItem>

            <GridItem span={8} rowSpan={2}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{FlowPairsLabels.Connections}</CardTitle>
                    {connections?.length ? (
                        <RealTimeLineChart
                            options={{
                                height: REAL_TIME_CONNECTION_HEIGHT_CHART,
                                padding: {
                                    top: 0,
                                    bottom: 50,
                                    left: 50,
                                    right: 20,
                                },
                            }}
                            data={[{ name: 'Connections', value: connections.length }]}
                        />
                    ) : (
                        <EmptyData />
                    )}
                </Card>
            </GridItem>
            <GridItem span={2}>
                <Card isFullHeight>
                    <CardTitle>Total Bytes TX</CardTitle>
                    <CardBody>{formatBytes(totalBytesSent)}</CardBody>
                </Card>
            </GridItem>
            <GridItem span={2}>
                <Card isFullHeight>
                    <CardTitle>Total Bytes RX</CardTitle>
                    <CardBody>{formatBytes(totalBytesReceived)}</CardBody>
                </Card>
            </GridItem>
            <GridItem span={2}>
                <Card isFullHeight>
                    <CardTitle>Average Byte rate TX</CardTitle>
                    <CardBody>{formatByteRate(AvgByteRateSent)}</CardBody>
                </Card>
            </GridItem>
            <GridItem span={2}>
                <Card isFullHeight>
                    <CardTitle>Average Byte rate RX</CardTitle>
                    <CardBody>{formatByteRate(AvgByteRateReceived)}</CardBody>
                </Card>
            </GridItem>
            <GridItem span={6}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{FlowPairsLabels.FlowPairsDistributionTitle}</CardTitle>
                    {topClients?.length ? (
                        <ChartPie
                            constrainToVisibleArea
                            data={topClients?.map(({ name, value }) => ({
                                x: name,
                                y: formatBytes(value),
                            }))}
                            labels={topClients?.map(
                                ({ name, value }) => `${name}: ${formatBytes(value)}`,
                            )}
                            legendData={topClients?.map(({ name }) => ({ name }))}
                            legendOrientation="vertical"
                            legendPosition="right"
                            padding={{
                                bottom: 100,
                                left: -100,
                                right: 100,
                                top: 0,
                            }}
                            themeColor={ChartThemeColors.Multi}
                            height={REAL_TIME_CONNECTION_HEIGHT_CHART}
                        />
                    ) : (
                        <EmptyData />
                    )}
                </Card>
            </GridItem>
            <GridItem span={6}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{FlowPairsLabels.FlowPairsDistributionTitle}</CardTitle>
                    {topClients?.length ? (
                        <RealTimeLineChart
                            options={{
                                type: 'area',
                                formatter: formatBytes,
                                height: REAL_TIME_CONNECTION_HEIGHT_CHART,
                                padding: {
                                    top: 0,
                                    bottom: 70,
                                    left: 70,
                                    right: 20,
                                },
                            }}
                            data={topClients}
                        />
                    ) : (
                        <EmptyData />
                    )}
                </Card>
            </GridItem>
            <GridItem>
                <Card isRounded className="pf-u-pt-md">
                    <FlowsPairsTable flowPairs={connections} />
                </Card>
            </GridItem>
        </Grid>
    );
};

export default FlowsPairs;
