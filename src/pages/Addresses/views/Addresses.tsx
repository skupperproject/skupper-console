import React, { useState } from 'react';

import {
    Card,
    Text,
    TextContent,
    TextVariants,
    CardTitle,
    Flex,
    Tooltip,
    Stack,
    StackItem,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { AddressesRoutesPaths, Labels, AddressesColumns } from '../Addresses.enum';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const REAL_TIME_CONNECTION_HEIGHT_CHART = 400;

const Addresses = function () {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL / 4);

    const { data: vanServices, isLoading } = useQuery(
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

    if (isLoading) {
        return <LoadingPage />;
    }

    const chartData = vanServices?.map(({ name, currentFlows }) => ({ name, value: currentFlows }));

    return (
        <Stack hasGutter>
            <StackItem>
                <Card data-cy="sk-vanservices-services">
                    <CardTitle>
                        <Flex>
                            <TextContent>
                                <Text component={TextVariants.h1}>{Labels.Addresses}</Text>
                            </TextContent>
                            <Tooltip position="right" content={Labels.AddressesDescription}>
                                <OutlinedQuestionCircleIcon />
                            </Tooltip>
                        </Flex>
                    </CardTitle>
                    <TableComposable borders={false} variant="compact" isStriped>
                        <Thead>
                            <Tr>
                                <Th>{AddressesColumns.Name}</Th>
                                <Th className="align-th-right">
                                    {AddressesColumns.CurrentFlowPairs}
                                </Th>
                                <Th className="align-th-right">
                                    {AddressesColumns.TotalFlowPairs}
                                </Th>
                                <Th className="align-th-right">
                                    {AddressesColumns.TotalListeners}
                                </Th>
                                <Th className="align-th-right">
                                    {AddressesColumns.TotalConnectors}
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {vanServices?.map(
                                ({
                                    identity,
                                    name,
                                    listenerCount,
                                    connectorCount,
                                    totalFlows,
                                    currentFlows,
                                }) => (
                                    <Tr key={identity}>
                                        <Td>
                                            <ResourceIcon type="address" />
                                            <Link
                                                to={`${AddressesRoutesPaths.FlowsPairs}/${name}@${identity}`}
                                            >
                                                {name}
                                            </Link>
                                        </Td>
                                        <Td className="align-td-right">{`${currentFlows}`}</Td>
                                        <Td className="align-td-right">{`${totalFlows}`}</Td>
                                        <Td className="align-td-right">{`${listenerCount}`}</Td>
                                        <Td className="align-td-right">{`${connectorCount}`}</Td>
                                    </Tr>
                                ),
                            )}
                        </Tbody>
                    </TableComposable>
                </Card>
            </StackItem>
            <StackItem>
                <Card style={{ height: `${REAL_TIME_CONNECTION_HEIGHT_CHART}px` }}>
                    <CardTitle>{Labels.Connections}</CardTitle>
                    {chartData?.length ? (
                        <RealTimeLineChart
                            options={{
                                height: REAL_TIME_CONNECTION_HEIGHT_CHART,
                                chartColor: ChartThemeColors.Multi,
                                dataLegend: chartData.map(({ name }) => ({ name })),
                                padding: {
                                    top: 0,
                                    bottom: 210,
                                    left: 0,
                                    right: 0,
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
