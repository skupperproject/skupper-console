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
import { DEFAULT_TABLE_PAGE_SIZE, UPDATE_INTERVAL } from 'config';

import { RequestsByAddressColumns } from '../Addresses.constants';
import { FlowPairsLabels, AddressesRoutesPathLabel, AddressesRoutesPaths } from '../Addresses.enum';
import { ChartData, ChartProps, RequestsByAddressProps } from '../Addresses.interfaces';
import { QueriesAddresses } from '../services/services.enum';
import { minutesAgo } from './ConnectionsByAddress';
import FlowPairsTable from './FlowPairsTable';
import ServersTable from './ServersTable';

const DEFAULT_HEIGHT_CHART = 350;
const MINUTES_AGO = 1;

const initAllRequestsQueryParamsPaginated = {
    timeRangeStart: 0,
    limit: DEFAULT_TABLE_PAGE_SIZE,
};

const initRequestsTimeLimitedQueryParams = {
    timeRangeStart: minutesAgo(new Date().getTime() * 1000, MINUTES_AGO),
};

const initServersQueryParams = {
    timeRangeStart: 0,
    limit: DEFAULT_TABLE_PAGE_SIZE,
};

const RequestsByAddress: FC<RequestsByAddressProps> = function ({ addressId, addressName }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL * 2);
    const [addressView, setAddressView] = useState<number>(0);
    const [requestsQueryParamsPaginated, setRequestsQueryParamsPaginated] =
        useState<RequestOptions>(initAllRequestsQueryParamsPaginated);

    const { data: requestsDataPaginated, isLoading: isLoadingRequestsPaginated } = useQuery(
        [QueriesAddresses.GetFlowPairsByAddress, addressId, requestsQueryParamsPaginated],
        () =>
            addressId
                ? RESTApi.fetchFlowPairsByAddress(addressId, requestsQueryParamsPaginated)
                : null,
        {
            keepPreviousData: true,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: requestsTimeLimitedData, isLoading: isLoadingRequestsTimeLimited } = useQuery(
        [QueriesAddresses.GetFlowPairsByAddressForChart, addressId],
        () =>
            addressId
                ? RESTApi.fetchFlowPairsByAddress(addressId, initRequestsTimeLimitedQueryParams)
                : null,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: serversByAddressData, isLoading: isLoadingServersByAddress } = useQuery(
        [QueriesAddresses.GetProcessesByAddress, addressId, initServersQueryParams],
        () => (addressId ? RESTApi.fetchServersByAddress(addressId, initServersQueryParams) : null),
        {
            keepPreviousData: true,
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

    const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
        setRequestsQueryParamsPaginated(params);
    }, []);

    const servers = serversByAddressData?.results || [];
    const serversRowsCount = serversByAddressData?.totalCount;

    const requestsPaginated = requestsDataPaginated?.results || [];
    const requestsPaginatedCount = requestsDataPaginated?.totalCount;

    const requestsTimeLimited = requestsTimeLimitedData?.results || [];

    // chart metrics
    const methodsSummaryMap = requestsTimeLimited.reduce((acc, { forwardFlow: { method } }) => {
        acc[method] = { name: method, x: method, y: (acc[method]?.y || 0) + 1 };

        return acc;
    }, {} as Record<string, ChartData>);
    const methodsSummary = Object.values(methodsSummaryMap);

    const statusCodesSummaryMap = requestsTimeLimited.reduce((acc, { counterFlow: { result } }) => {
        acc[`${result}`] = { name: `${result}`, x: `${result}`, y: (acc[result]?.y || 0) + 1 };

        return acc;
    }, {} as Record<string, ChartData>);
    const statusCodesSummary = Object.values(statusCodesSummaryMap);

    // global address metrics
    const uploadedTraffic = servers.reduce((acc, { octetsSent }) => acc + octetsSent, 0);
    const downloadedTraffic = servers.reduce((acc, { octetsReceived }) => acc + octetsReceived, 0);

    let count = 0;
    const avgSpeedOut = Math.round(
        servers.reduce((acc, { octetSentRate }) => {
            if (octetSentRate) {
                count += 1;
                acc = (acc + octetSentRate) / count;
            }

            return acc;
        }, 0),
    );

    count = 0;
    const avgSpeedIn = Math.round(
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
                        {!!requestsTimeLimited?.length && (
                            <Link
                                to={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.AddressId}=${addressId}`}
                            >
                                {`(${FlowPairsLabels.GoToTopology})`}
                            </Link>
                        )}
                    </Flex>
                </GridItem>

                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>{FlowPairsLabels.TrafficRx}</CardTitle>
                        <CardBody>{formatBytes(downloadedTraffic)}</CardBody>
                    </Card>
                </GridItem>

                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>{FlowPairsLabels.TrafficTx}</CardTitle>
                        <CardBody>{formatBytes(uploadedTraffic)}</CardBody>
                    </Card>
                </GridItem>

                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>{FlowPairsLabels.AvgByteRateRx}</CardTitle>
                        <CardBody>{formatByteRate(avgSpeedIn)}</CardBody>
                    </Card>
                </GridItem>

                <GridItem span={3}>
                    <Card isFullHeight>
                        <CardTitle>{FlowPairsLabels.AvgByteRateTx}</CardTitle>
                        <CardBody>{formatByteRate(avgSpeedOut)}</CardBody>
                    </Card>
                </GridItem>

                <GridItem span={6}>
                    <Card style={{ height: `${DEFAULT_HEIGHT_CHART}px` }}>
                        <CardTitle>{FlowPairsLabels.RequestMethodsSummary}</CardTitle>
                        {methodsSummary?.length ? (
                            <MethodsSummaryChart
                                data={methodsSummary}
                                options={{ themeColor: ChartThemeColors.Multi }}
                            />
                        ) : (
                            <EmptyData />
                        )}
                    </Card>
                </GridItem>

                <GridItem span={6}>
                    <Card style={{ height: `${DEFAULT_HEIGHT_CHART}px` }}>
                        <CardTitle>{FlowPairsLabels.StatusCodeSummary}</CardTitle>
                        {statusCodesSummary?.length ? (
                            <StatusCodeChart
                                data={statusCodesSummary}
                                options={{ themeColor: ChartThemeColors.Multi }}
                            />
                        ) : (
                            <EmptyData />
                        )}
                    </Card>
                </GridItem>

                <GridItem>
                    <Card isRounded className="pf-u-pt-md">
                        <Tabs activeKey={addressView} onSelect={handleTabClick}>
                            {requestsPaginated && (
                                <Tab
                                    eventKey={0}
                                    title={<TabTitleText>{FlowPairsLabels.Requests}</TabTitleText>}
                                >
                                    <FlowPairsTable
                                        columns={RequestsByAddressColumns}
                                        connections={requestsPaginated}
                                        onGetFilters={handleGetFiltersConnections}
                                        rowsCount={requestsPaginatedCount}
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
            {(isLoadingRequestsTimeLimited ||
                isLoadingServersByAddress ||
                isLoadingRequestsPaginated) && <LoadingPage isFLoating={true} />}
        </>
    );
};

export default RequestsByAddress;

const StatusCodeChart: FC<ChartProps> = function ({ data, options }) {
    return (
        <ChartPie
            constrainToVisibleArea
            data={data?.map(({ x, y }) => ({
                x,
                y: formatBytes(y),
            }))}
            labels={data?.map(({ name, y }) => `${name}: ${y}`)}
            legendData={data?.map(({ name }) => ({
                name: `${name}`,
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

const MethodsSummaryChart: FC<ChartProps> = function ({ data, options }) {
    return (
        <Chart
            containerComponent={
                <ChartVoronoiContainer
                    labels={({ datum }) => `${datum.name}: ${datum.y}`}
                    constrainToVisibleArea
                />
            }
            legendData={data?.map(({ name }) => ({
                name: `${name}`,
            }))}
            legendOrientation="vertical"
            legendPosition="right"
            themeColor={options?.themeColor || ChartThemeColors.Orange}
            height={DEFAULT_HEIGHT_CHART}
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
