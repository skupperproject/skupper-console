import React, { FC, useCallback, useState } from 'react';

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
import { Link, useNavigate } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { setMinutesAgo } from '@core/utils/setMinutesAgo';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import {
    TopologyRoutesPaths,
    TopologyURLFilters,
    TopologyViews,
} from '@pages/Topology/Topology.enum';
import { RESTApi } from 'API/REST';
import { RequestOptions } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE, UPDATE_INTERVAL } from 'config';

import { ConnectionsByAddressColumns } from '../Addresses.constants';
import {
    FlowPairsLabelsTcp,
    AddressesRoutesPathLabel,
    AddressesRoutesPaths,
} from '../Addresses.enum';
import { ConnectionsByAddressProps } from '../Addresses.interfaces';
import FlowPairsTable from '../components/FlowPairsTable';
import ServersTable from '../components/ServersTable';
import { QueriesAddresses } from '../services/services.enum';

const CONNECTION_HEIGHT_CHART = 350;
const MINUTES_AGO = 5;
const TOP_CLIENT_MAX = 10;

const initConnectionsQueryParamsPaginated = {
    offset: 0,
    limit: DEFAULT_TABLE_PAGE_SIZE,
    filter: 'endTime.0', // open connections
};

const initConnectionsTimeLimitedQueryParams = {
    timeRangeStart: setMinutesAgo(new Date().getTime(), MINUTES_AGO) * 1000,
};

const ConnectionsByAddress: FC<ConnectionsByAddressProps> = function ({ addressId, addressName }) {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [addressView, setAddressView] = useState<number>(0);
    const [connectionsQueryParamsPaginated, setConnectionsQueryParamsPaginated] =
        useState<RequestOptions>(initConnectionsQueryParamsPaginated);

    const { data: activeConnectionsData, isLoading: isLoadingActiveConnections } = useQuery(
        [QueriesAddresses.GetFlowPairsByAddress, addressId],
        () =>
            addressId
                ? RESTApi.fetchFlowPairsByAddress(addressId, connectionsQueryParamsPaginated)
                : undefined,
        {
            keepPreviousData: true,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: connectionsFromLastMinutesData, isLoading: isLoadingConnectionsFromLastMinutes } =
        useQuery(
            ['QueriesAddresses.GetFlowPairsByAddressForChart', addressId],
            () =>
                addressId
                    ? RESTApi.fetchFlowPairsByAddress(
                          addressId,
                          initConnectionsTimeLimitedQueryParams,
                      )
                    : undefined,
            {
                refetchInterval,
                onError: handleError,
            },
        );

    const { data: serversByAddressData, isLoading: isLoadingServersByAddress } = useQuery(
        [QueriesAddresses.GetProcessesByAddress, addressId],
        () =>
            addressId
                ? RESTApi.fetchServersByAddress(addressId, connectionsQueryParamsPaginated)
                : null,
        {
            onError: handleError,
            keepPreviousData: true,
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
        setConnectionsQueryParamsPaginated(connectionsQueryParamsPaginated);
        setAddressView(tabIndex as number);
    }

    const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
        setConnectionsQueryParamsPaginated(params);
    }, []);

    const activeConnections =
        activeConnectionsData?.results.filter(({ endTime }) => !endTime) || [];
    const activeConnectionsCount = activeConnectionsData?.totalCount;

    const connectionsFromLastMinutes =
        connectionsFromLastMinutesData?.results.filter(({ endTime }) => !endTime) || [];

    const servers = serversByAddressData?.results || [];
    const serversRowsCount = serversByAddressData?.totalCount;

    const topClientsTxMap = connectionsFromLastMinutes.reduce(
        (acc, { counterFlow: { process, processName, octets } }) => {
            acc[process] = {
                name: processName,
                value: (acc[process]?.value || 0) + octets,
            };

            return acc;
        },
        {} as Record<string, { name: string; value: number }>,
    );

    const topClientsTx = Object.values(topClientsTxMap)
        .sort((a, b) => b.value - a.value)
        .slice(0, TOP_CLIENT_MAX - 1);

    const topClientsRxMap = connectionsFromLastMinutes.reduce(
        (acc, { counterFlow: { processName, process }, forwardFlow: { octets } }) => {
            acc[process] = {
                name: processName,
                value: (acc[process]?.value || 0) + octets,
            };

            return acc;
        },
        {} as Record<string, { name: string; value: number }>,
    );
    const topClientsRx = Object.values(topClientsRxMap)
        .sort((a, b) => b.value - a.value)
        .slice(0, TOP_CLIENT_MAX - 1);

    const totalBytesSent = servers.reduce((acc, { octetsSent }) => acc + octetsSent, 0);
    const totalBytesReceived = servers.reduce((acc, { octetsReceived }) => acc + octetsReceived, 0);

    let count = 0;
    const avgSpeedSent = Math.round(
        servers.reduce((acc, { octetSentRate }) => {
            if (octetSentRate) {
                count += 1;
                acc = (acc + octetSentRate) / count;
            }

            return acc;
        }, 0),
    );

    count = 0;
    const avgSpeedReceived = Math.round(
        servers.reduce((acc, { octetReceivedRate }) => {
            if (octetReceivedRate) {
                count += 1;
                acc = (acc + octetReceivedRate) / count;
            }

            return acc;
        }, 0),
    );

    return (
        <>
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
                        {!!connectionsFromLastMinutes?.length && (
                            <Link
                                to={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.AddressId}=${addressId}`}
                            >
                                {'( Go to Network view )'}
                            </Link>
                        )}
                    </Flex>
                </GridItem>

                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>{FlowPairsLabelsTcp.TrafficRx}</CardTitle>
                        <CardBody>{formatBytes(totalBytesReceived)}</CardBody>
                    </Card>
                </GridItem>

                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>{FlowPairsLabelsTcp.TrafficTx}</CardTitle>
                        <CardBody>{formatBytes(totalBytesSent)}</CardBody>
                    </Card>
                </GridItem>

                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>{FlowPairsLabelsTcp.AvgByteRateRx}</CardTitle>
                        <CardBody>{formatByteRate(avgSpeedReceived)}</CardBody>
                    </Card>
                </GridItem>

                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>{FlowPairsLabelsTcp.AvgByteRateTx}</CardTitle>
                        <CardBody>{formatByteRate(avgSpeedSent)}</CardBody>
                    </Card>
                </GridItem>

                <GridItem span={6}>
                    <Card style={{ height: `${CONNECTION_HEIGHT_CHART}px` }}>
                        <CardTitle>{FlowPairsLabelsTcp.TopClientTxTraffic}</CardTitle>
                        {topClientsTx?.length ? (
                            <ChartPie
                                data={topClientsTx?.map(({ name, value }) => ({
                                    x: name,
                                    y: formatBytes(value),
                                }))}
                                labels={topClientsTx?.map(
                                    ({ name, value }) => `${name}: ${formatBytes(value)}`,
                                )}
                                legendData={topClientsTx?.map(({ name, value }) => ({
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
                                height={CONNECTION_HEIGHT_CHART}
                            />
                        ) : (
                            <EmptyData />
                        )}
                    </Card>
                </GridItem>

                <GridItem span={6}>
                    <Card style={{ height: `${CONNECTION_HEIGHT_CHART}px` }}>
                        <CardTitle>{FlowPairsLabelsTcp.TopClientRxTraffic}</CardTitle>
                        {topClientsRx?.length ? (
                            <ChartPie
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
                                themeColor={ChartThemeColors.Green}
                                height={CONNECTION_HEIGHT_CHART}
                            />
                        ) : (
                            <EmptyData />
                        )}
                    </Card>
                </GridItem>

                <GridItem>
                    <Card isRounded className="pf-u-pt-md">
                        <Tabs activeKey={addressView} onSelect={handleTabClick}>
                            {activeConnections && (
                                <Tab
                                    eventKey={0}
                                    title={
                                        <TabTitleText>
                                            {FlowPairsLabelsTcp.ActiveConnections}
                                        </TabTitleText>
                                    }
                                >
                                    <FlowPairsTable
                                        columns={ConnectionsByAddressColumns}
                                        connections={activeConnections}
                                        onGetFilters={handleGetFiltersConnections}
                                        rowsCount={activeConnectionsCount}
                                    />
                                </Tab>
                            )}
                            {serversRowsCount && (
                                <Tab
                                    eventKey={1}
                                    title={
                                        <TabTitleText>{FlowPairsLabelsTcp.Servers}</TabTitleText>
                                    }
                                >
                                    <ServersTable processes={servers} />
                                </Tab>
                            )}
                        </Tabs>
                    </Card>
                </GridItem>
            </Grid>
            {(isLoadingServersByAddress ||
                isLoadingActiveConnections ||
                isLoadingConnectionsFromLastMinutes) && <LoadingPage isFLoating={true} />}
        </>
    );
};

export default ConnectionsByAddress;
