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
import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import {
    TopologyRoutesPaths,
    TopologyURLFilters,
    TopologyViews,
} from '@pages/Topology/Topology.enum';
import { RESTApi } from 'API/REST';
import { AvailableProtocols } from 'API/REST.enum';
import { RequestOptions } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE, UPDATE_INTERVAL } from 'config';

import { ConnectionsByAddressColumns } from '../Addresses.constants';
import { FlowPairsLabels, AddressesRoutesPathLabel, AddressesRoutesPaths } from '../Addresses.enum';
import FlowPairsTable from '../components/FlowPairsTable';
import ServersTable from '../components/ServersTable';
import { QueriesAddresses } from '../services/services.enum';

const REAL_TIME_CONNECTION_HEIGHT_CHART = 350;
const ITEM_DISPLAY_COUNT = 6;

const defaultFilters = {
    offset: 0,
    limit: DEFAULT_TABLE_PAGE_SIZE,
};

interface ConnectionsByAddressProps {
    addressName: string;
    addressId: string;
}

const ConnectionsByAddress: FC<ConnectionsByAddressProps> = function ({ addressId, addressName }) {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [addressView, setAddressView] = useState<number>(0);
    const [flowPairsFilters, setFlowPairsFilters] = useState<RequestOptions>(defaultFilters);

    const { data: allFlowPairsData, isLoading: isLoadingTopFlowPairs } = useQuery(
        [QueriesAddresses.GetFlowPairsByAddressForChart, addressId],
        () => (addressId ? RESTApi.fetchFlowPairsByAddress(addressId) : undefined),
        {
            cacheTime: 0,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: serversByAddressData, isLoading: isLoadingServersByAddress } = useQuery(
        [QueriesAddresses.GetProcessesByAddress, addressId, flowPairsFilters],
        () => (addressId ? RESTApi.fetchServersByAddress(addressId, flowPairsFilters) : null),
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
        setFlowPairsFilters(defaultFilters);
        setAddressView(tabIndex as number);
    }

    const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
        setFlowPairsFilters(params);
    }, []);

    const flowPairs = allFlowPairsData?.results.filter(({ endTime }) => !endTime) || [];
    const FlowPairsForCharts =
        allFlowPairsData?.results.filter(
            ({ forwardFlow: { protocol } }) => protocol === AvailableProtocols.Tcp,
        ) || [];

    const servers = serversByAddressData?.results || [];
    const serversRowsCount = serversByAddressData?.totalCount;

    const topConnections = FlowPairsForCharts || [];

    const topClientsMap = topConnections.reduce(
        (acc, { forwardFlow: { process, processName, octets } }, index) => {
            if (index < ITEM_DISPLAY_COUNT) {
                acc[processName] = {
                    name: processName,
                    value: (acc[process]?.value || 0) + octets,
                };
            }

            return acc;
        },
        {} as Record<string, { name: string; value: number }>,
    );

    const topClientsRxMap = topConnections.reduce(
        (acc, { forwardFlow: { process, processName, octets } }, index) => {
            if (index < ITEM_DISPLAY_COUNT) {
                acc[processName] = {
                    name: processName,
                    value: (acc[process]?.value || 0) + octets,
                };
            }

            return acc;
        },
        {} as Record<string, { name: string; value: number }>,
    );

    const topClients = Object.values(topClientsMap);
    const topClientsRx = Object.values(topClientsRxMap);

    const totalBytesSent = topConnections.reduce(
        (acc, { forwardFlow: { octets } }) => acc + octets,
        0,
    );
    const totalBytesReceived = topConnections.reduce(
        (acc, { counterFlow: { octets } }) => acc + octets,
        0,
    );

    const AvgByteRateSent = Math.round(
        topConnections.reduce((acc, { forwardFlow: { octetRate } }) => acc + octetRate, 0) /
            (topConnections.length || 1),
    );

    const AvgByteRateReceived = Math.round(
        topConnections.reduce((acc, { counterFlow: { octetRate } }) => acc + octetRate, 0) /
            (topConnections.length || 1),
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
                        {!!FlowPairsForCharts?.length && (
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
                        {FlowPairsForCharts?.length ? (
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
                                data={[{ name: 'Connections', value: FlowPairsForCharts.length }]}
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
                                themeColor={ChartThemeColors.Green}
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
                            {flowPairs && (
                                <Tab
                                    eventKey={0}
                                    title={
                                        <TabTitleText>{FlowPairsLabels.Connections}</TabTitleText>
                                    }
                                >
                                    <FlowPairsTable
                                        columns={ConnectionsByAddressColumns}
                                        connections={flowPairs}
                                        onGetFilters={handleGetFiltersConnections}
                                    />
                                </Tab>
                            )}
                            {serversRowsCount && (
                                <Tab
                                    eventKey={1}
                                    title={<TabTitleText>{FlowPairsLabels.Servers}</TabTitleText>}
                                >
                                    <ServersTable
                                        processes={servers}
                                        rowsCount={serversRowsCount}
                                        onGetFilters={handleGetFiltersConnections}
                                    />
                                </Tab>
                            )}
                        </Tabs>
                    </Card>
                </GridItem>
            </Grid>
            {(isLoadingTopFlowPairs || isLoadingServersByAddress) && (
                <LoadingPage isFLoating={true} />
            )}
        </>
    );
};

export default ConnectionsByAddress;
