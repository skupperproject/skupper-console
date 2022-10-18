import React, { useState } from 'react';

import { Card, CardTitle, Stack, StackItem } from '@patternfly/react-core';
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

const REAL_TIME_CONNECTION_HEIGHT_CHART = 500;

const Addresses = function () {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL / 4);

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

    const chartData = addresses?.map(({ name, currentFlows }) => ({ name, value: currentFlows }));

    return (
        <Stack hasGutter>
            <StackItem>
                <AddressesTable addresses={addresses} />
            </StackItem>
            <StackItem>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{AddressesLabels.Connections}</CardTitle>
                    {chartData?.length ? (
                        <RealTimeLineChart
                            options={{
                                height: REAL_TIME_CONNECTION_HEIGHT_CHART,
                                chartColor: ChartThemeColors.Multi,
                                dataLegend: chartData.map(({ name }) => ({ name })),
                                padding: {
                                    top: 0,
                                    bottom: 130,
                                    left: 50,
                                    right: 20,
                                },
                            }}
                            data={chartData}
                        />
                    ) : (
                        <EmptyData />
                    )}
                </Card>
            </StackItem>
        </Stack>
    );
};

export default Addresses;
