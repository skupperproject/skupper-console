import React, { FC, useCallback, useState } from 'react';

import { Chart, ChartBar, ChartPie, ChartVoronoiContainer } from '@patternfly/react-charts';
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
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import {
    TopologyRoutesPaths,
    TopologyURLFilters,
    TopologyViews,
} from '@pages/Topology/Topology.enum';
import { RESTApi } from 'API/REST';
import { RequestOptions } from 'API/REST.interfaces';
import { UPDATE_INTERVAL } from 'config';

import { RequestsByAddressColumns } from '../Addresses.constants';
import { FlowPairsLabels, AddressesRoutesPathLabel, AddressesRoutesPaths } from '../Addresses.enum';
import { QueriesAddresses } from '../services/services.enum';
import FlowPairsTable from './FlowPairsTable';
import ServersTable from './ServersTable';

const DEFAULT_HEIGHT_CHART = 350;

const serversQueryStringParams = {
    offset: 0,
    timeRangeStart: 0,
};

const flowPairsQueryStringParams = {
    timeRangeStart: 0,
};

interface RequestsByAddressProps {
    addressName: string;
    addressId: string;
}

interface ChartData {
    name: string;
    x: string;
    y: number;
}

const RequestsByAddress: FC<RequestsByAddressProps> = function ({ addressId, addressName }) {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL * 2);
    const [addressView, setAddressView] = useState<number>(0);
    const [serverQueryString, setServersQueryString] =
        useState<RequestOptions>(serversQueryStringParams);

    const { data: allFlowPairsData, isLoading: isLoadingTopFlowPairs } = useQuery(
        [QueriesAddresses.GetFlowPairsByAddressForChart, addressId, flowPairsQueryStringParams],
        () =>
            addressId
                ? RESTApi.fetchFlowPairsByAddress(addressId, flowPairsQueryStringParams)
                : null,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: serversByAddressData, isLoading: isLoadingServersByAddress } = useQuery(
        [QueriesAddresses.GetProcessesByAddress, addressId, serverQueryString],
        () => (addressId ? RESTApi.fetchServersByAddress(addressId, serverQueryString) : null),
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
        setServersQueryString(serversQueryStringParams);
        setAddressView(tabIndex as number);
    }

    const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
        setServersQueryString(params);
    }, []);

    const flowPairs = allFlowPairsData?.results || [];
    const FlowPairsForCharts = allFlowPairsData?.results || [];

    const servers = serversByAddressData?.results || [];
    const serversRowsCount = serversByAddressData?.totalCount;

    const topConnections = FlowPairsForCharts || [];

    const methodsSummaryMap = topConnections.reduce((acc, { forwardFlow: { method } }) => {
        acc[method] = { name: method, x: method, y: (acc[method]?.y || 0) + 1 };

        return acc;
    }, {} as Record<string, ChartData>);
    const methodsSummary = Object.values(methodsSummaryMap);

    const topTrafficUploadByClient = topConnections.reduce(
        (acc, { forwardFlow: { process, processName, octets } }) => {
            acc[processName] = {
                name: processName,
                x: processName,
                y: (acc[process]?.y || 0) + octets,
            };

            return acc;
        },
        {} as Record<string, ChartData>,
    );
    const topTrafficUpload = Object.values(topTrafficUploadByClient);

    const topClientsRxMap = topConnections.reduce(
        (acc, { counterFlow: { process, processName, octets } }) => {
            acc[processName] = {
                name: processName,
                x: processName,
                y: (acc[process]?.y || 0) + octets,
            };

            return acc;
        },
        {} as Record<string, ChartData>,
    );
    const tcpTrafficDownloaded = Object.values(topClientsRxMap);

    const UploadTraffic = topConnections.reduce(
        (acc, { forwardFlow: { octets } }) => acc + octets,
        0,
    );
    const downloadTraffic = topConnections.reduce(
        (acc, { counterFlow: { octets } }) => acc + octets,
        0,
    );

    let count = 0;
    const AvgByteRateSent = Math.round(
        topConnections.reduce((acc, { forwardFlow: { octetRate } }) => {
            if (octetRate) {
                count += 1;
                acc = (acc + octetRate) / count;
            }

            return acc;
        }, 0),
    );

    const AvgByteRateReceived = Math.round(
        topConnections.reduce((acc, { counterFlow: { octetRate } }) => {
            if (octetRate) {
                count += 1;
                acc = (acc + octetRate) / count;
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
                        {!!FlowPairsForCharts?.length && (
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
                        <CardTitle>Bytes Downloaded</CardTitle>
                        <CardBody>{formatBytes(downloadTraffic)}</CardBody>
                    </Card>
                </GridItem>
                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>Average Download speed</CardTitle>
                        <CardBody>{formatByteRate(AvgByteRateReceived)}</CardBody>
                    </Card>
                </GridItem>
                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>Bytes Uploaded</CardTitle>
                        <CardBody>{formatBytes(UploadTraffic)}</CardBody>
                    </Card>
                </GridItem>
                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>Average Upload speed</CardTitle>
                        <CardBody>{formatByteRate(AvgByteRateSent)}</CardBody>
                    </Card>
                </GridItem>

                <GridItem span={2}>
                    <Card style={{ height: `${DEFAULT_HEIGHT_CHART}px` }}>
                        <CardTitle>{FlowPairsLabels.RequestMethodsSummary}</CardTitle>
                        {methodsSummary?.length ? (
                            <MethodsSummaryChart data={methodsSummary} />
                        ) : (
                            <EmptyData />
                        )}
                    </Card>
                </GridItem>

                <GridItem span={5}>
                    <Card style={{ height: `${DEFAULT_HEIGHT_CHART}px` }}>
                        <CardTitle>{FlowPairsLabels.TopClientUploadTraffic}</CardTitle>
                        {topTrafficUpload?.length ? (
                            <TopTrafficChart data={topTrafficUpload} />
                        ) : (
                            <EmptyData />
                        )}
                    </Card>
                </GridItem>

                <GridItem span={5}>
                    <Card style={{ height: `${DEFAULT_HEIGHT_CHART}px` }}>
                        <CardTitle>{FlowPairsLabels.TopClientDownloadTraffic}</CardTitle>
                        {tcpTrafficDownloaded?.length ? (
                            <TopTrafficChart
                                data={tcpTrafficDownloaded}
                                options={{ themeColor: ChartThemeColors.Green }}
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
                                    title={<TabTitleText>{FlowPairsLabels.Requests}</TabTitleText>}
                                >
                                    <FlowPairsTable
                                        columns={RequestsByAddressColumns}
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
                                    <ServersTable processes={servers} />
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

export default RequestsByAddress;

interface ChartProps {
    data: ChartData[];
    options?: { themeColor: ChartThemeColors };
}

const TopTrafficChart: FC<ChartProps> = function ({ data, options }) {
    return (
        <ChartPie
            constrainToVisibleArea
            data={data?.map(({ x, y }) => ({
                x,
                y: formatBytes(y),
            }))}
            labels={data?.map(({ name, y }) => `${name}: ${formatBytes(y)}`)}
            legendData={data?.map(({ name, y }) => ({
                name: `${name}: ${formatBytes(y)}`,
            }))}
            legendOrientation="vertical"
            legendPosition="right"
            padding={{
                bottom: 100,
                left: -200,
                right: 20,
                top: 50,
            }}
            themeColor={options?.themeColor || ChartThemeColors.Blue}
            height={DEFAULT_HEIGHT_CHART}
        />
    );
};

const MethodsSummaryChart: FC<ChartProps> = function ({ data }) {
    return (
        <Chart
            containerComponent={
                <ChartVoronoiContainer
                    labels={({ datum }) => `${datum.name}: ${datum.y}`}
                    constrainToVisibleArea
                />
            }
            legendData={[{ name: 'POST' }, { name: 'GET' }]}
            legendOrientation="vertical"
            legendPosition="right"
            height={DEFAULT_HEIGHT_CHART}
            themeColor={ChartThemeColors.Orange}
            padding={{
                bottom: 100,
                left: 50,
                right: 200,
                top: 50,
            }}
        >
            <ChartBar data={data} barWidth={50} />
        </Chart>
    );
};
