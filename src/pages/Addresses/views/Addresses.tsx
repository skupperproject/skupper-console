import React, { useState } from 'react';

import { ChartPie } from '@patternfly/react-charts';
import { Card, CardTitle, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { AddressesLabels } from '../Addresses.enum';
import AddressesTable from '../components/AddressesTable';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const REAL_TIME_CONNECTION_HEIGHT_CHART = 350;
const ITEM_DISPLAY_COUNT = 6;

const Addresses = function () {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: addresses, isLoading } = useQuery(
        [QueriesAddresses.GetAddresses],
        AddressesController.getAddresses,
        {
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

    if (isLoading || !addresses) {
        return <LoadingPage />;
    }
    const sortedAddresses = addresses.sort((a, b) => b.currentFlows - a.currentFlows);

    const topCurrentConnectionsChartData = sortedAddresses
        .map(({ name, currentFlows }) => ({
            name,
            value: currentFlows,
        }))
        .reduce((acc, item, index) => {
            if (index < ITEM_DISPLAY_COUNT) {
                acc.push(item);
            }

            return acc;
        }, [] as { name: string; value: number }[]);

    const ActiveConnectionsChartData = topCurrentConnectionsChartData.reduce(
        (acc, address) => acc + address.value,
        0,
    );

    return (
        <Grid hasGutter>
            <GridItem>
                <AddressesTable addresses={sortedAddresses} />
            </GridItem>

            <GridItem span={8}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{AddressesLabels.CurrentConnections}</CardTitle>
                    {topCurrentConnectionsChartData?.length ? (
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
                            data={[{ name: 'Connections', value: ActiveConnectionsChartData }]}
                        />
                    ) : (
                        <EmptyData />
                    )}
                </Card>
            </GridItem>
            <GridItem span={4}>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{AddressesLabels.ConnectionsByAddress}</CardTitle>
                    <ChartPie
                        constrainToVisibleArea
                        data={topCurrentConnectionsChartData?.map(({ name, value }) => ({
                            x: name,
                            y: value,
                        }))}
                        labels={topCurrentConnectionsChartData?.map(
                            ({ name, value }) => `${name}: ${value}`,
                        )}
                        padding={{
                            bottom: 100,
                            left: -100,
                            right: 100,
                            top: 0,
                        }}
                        legendData={topCurrentConnectionsChartData?.map(({ name }) => ({ name }))}
                        legendOrientation="vertical"
                        legendPosition="right"
                        themeColor={ChartThemeColors.Multi}
                        height={REAL_TIME_CONNECTION_HEIGHT_CHART}
                    />
                </Card>
            </GridItem>
        </Grid>
    );
};

export default Addresses;
