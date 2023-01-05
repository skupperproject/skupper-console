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
    Tab,
    Tabs,
    TabTitleText,
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
import { QueriesSites } from '@pages/Sites/services/services.enum';
import {
    TopologyRoutesPaths,
    TopologyURLFilters,
    TopologyViews,
} from '@pages/Topology/Topology.enum';
import { RESTApi } from 'API/REST';
import { UPDATE_INTERVAL } from 'config';

import { FlowPairsLabels, AddressesRoutesPathLabel, AddressesRoutesPaths } from '../Addresses.enum';
import FlowPairsTable from '../components/FlowPairsTable';
import ServersTable from '../components/ServersTable';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const REAL_TIME_CONNECTION_HEIGHT_CHART = 350;
const ITEM_DISPLAY_COUNT = 11;

const FlowsPairs = function () {
    const navigate = useNavigate();
    const { address } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [addressView, setAddressView] = useState<number>(0);

    const addressId = address?.split('@')[1];
    const addressName = address?.split('@')[0];

    const { data: flowPairs, isLoading: isLoadingFlowPairs } = useQuery(
        [QueriesAddresses.GetFlowPairsByAddress, addressId],
        () => (addressId ? RESTApi.fetchFlowPairsByAddress(addressId) : null),
        {
            cacheTime: 0,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: sites, isLoading: isLoadingSites } = useQuery(
        [QueriesSites.GetSites, addressId],
        () => RESTApi.fetchSites(),
        {
            cacheTime: 0,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: serversByAddress, isLoading: isLoadingServersByAddress } = useQuery(
        [QueriesAddresses.GetProcessesByAddress, addressId],
        () => (addressId ? RESTApi.fetchServersByAddress(addressId) : null),
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

    function handleTabClick(
        _: React.MouseEvent<HTMLElement, MouseEvent>,
        tabIndex: string | number,
    ) {
        setAddressView(tabIndex as number);
    }

    if (isLoadingFlowPairs || isLoadingServersByAddress || isLoadingSites) {
        return <LoadingPage />;
    }

    if (!flowPairs || !sites || !serversByAddress) {
        return null;
    }

    const connections = AddressesController.getFlowPairsByAddress(flowPairs, sites);

    const topClientsMap = connections.reduce((acc, { processId, processName, bytes }, index) => {
        if (index < ITEM_DISPLAY_COUNT) {
            acc[processName] = { name: processName, value: (acc[processId]?.value || 0) + bytes };
        }

        return acc;
    }, {} as Record<string, { name: string; value: number }>);

    const topClientsRxMap = connections.reduce(
        (acc, { processId, processName, targetBytes }, index) => {
            if (index < ITEM_DISPLAY_COUNT) {
                acc[processName] = {
                    name: processName,
                    value: (acc[processId]?.value || 0) + targetBytes,
                };
            }

            return acc;
        },
        {} as Record<string, { name: string; value: number }>,
    );

    const topClients = Object.values(topClientsMap);
    const topClientsRx = Object.values(topClientsRxMap);

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
                    {!!connections.length && (
                        <Link
                            to={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.AddressId}=${addressId}`}
                        >
                            {'( Go to Network view )'}
                        </Link>
                    )}
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
                    <CardTitle>{FlowPairsLabels.TopClientTxTraffic}</CardTitle>
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
                            legendData={topClients?.map(({ name, value }) => ({
                                name: `${name}: ${formatBytes(value)}`,
                            }))}
                            legendOrientation="vertical"
                            legendPosition="right"
                            padding={{
                                bottom: 100,
                                left: -300,
                                right: 100,
                                top: 0,
                            }}
                            themeColor={ChartThemeColors.Blue}
                            height={REAL_TIME_CONNECTION_HEIGHT_CHART}
                        />
                    ) : (
                        <EmptyData />
                    )}
                </Card>
            </GridItem>

            <GridItem span={6}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{FlowPairsLabels.TopClientRxTraffic}</CardTitle>
                    {topClientsRx?.length ? (
                        <ChartPie
                            constrainToVisibleArea
                            data={topClientsRx?.map(({ name, value }) => ({
                                x: name,
                                y: formatBytes(value),
                            }))}
                            labels={topClientsRx?.map(
                                ({ name, value }) => `${name}: ${formatBytes(value)}`,
                            )}
                            legendData={topClientsRx?.map(({ name, value }) => ({
                                name: `${name}: ${formatBytes(value)}`,
                            }))}
                            legendOrientation="vertical"
                            legendPosition="right"
                            padding={{
                                bottom: 100,
                                left: -300,
                                right: 100,
                                top: 0,
                            }}
                            themeColor={ChartThemeColors.Orange}
                            height={REAL_TIME_CONNECTION_HEIGHT_CHART}
                        />
                    ) : (
                        <EmptyData />
                    )}
                </Card>
            </GridItem>

            <GridItem>
                <Card isRounded className="pf-u-pt-md">
                    <Tabs activeKey={addressView} onSelect={handleTabClick}>
                        <Tab
                            eventKey={0}
                            title={<TabTitleText>{FlowPairsLabels.Connections}</TabTitleText>}
                        >
                            <FlowPairsTable connections={connections} />
                        </Tab>
                        <Tab
                            eventKey={1}
                            title={<TabTitleText>{FlowPairsLabels.Servers}</TabTitleText>}
                        >
                            <ServersTable processes={serversByAddress} />
                        </Tab>
                    </Tabs>
                </Card>
            </GridItem>
        </Grid>
    );
};

export default FlowsPairs;
