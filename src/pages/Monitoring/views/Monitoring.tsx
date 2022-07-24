import React, { useState } from 'react';

import {
    Card,
    Text,
    TextContent,
    TextVariants,
    CardTitle,
    Flex,
    Tooltip,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { MonitoringRoutesPaths } from '../Monitoring.enum';
import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';
import { Labels, OverviewColumns } from './Monitoring.enum';

const Overview = function () {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: vanServices, isLoading } = useQuery(
        QueriesMonitoring.GetVanAdresses,
        MonitorServices.fetchVanAddresses,
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

    return (
        <Card data-cy="sk-monitoring-services">
            <CardTitle>
                <Flex>
                    <TextContent>
                        <Text component={TextVariants.h1}>{Labels.VanServices}</Text>
                    </TextContent>
                    <Tooltip position="right" content={Labels.VanServicesDescription}>
                        <InfoCircleIcon color="var(--pf-global--palette--black-500)" />
                    </Tooltip>
                </Flex>
            </CardTitle>
            <TableComposable className="flows-table" borders={false} variant="compact" isStriped>
                <Thead>
                    <Tr>
                        <Th>{OverviewColumns.Name}</Th>
                        <Th>{OverviewColumns.TotalListeners}</Th>
                        <Th>{OverviewColumns.TotalConnectors}</Th>
                        <Th>{OverviewColumns.NumFLows}</Th>
                        <Th>{OverviewColumns.NumFlowsActive}</Th>
                    </Tr>
                </Thead>
                {vanServices?.map(
                    ({
                        identity,
                        name,
                        listenerCount,
                        connectorCount,
                        totalFlows,
                        currentFlows,
                    }) => (
                        <Tbody key={identity}>
                            <Tr>
                                <Td dataLabel={OverviewColumns.Name}>
                                    <ResourceIcon type="vanAddress" />

                                    <Link to={`${MonitoringRoutesPaths.Connections}/${name}`}>
                                        {name}
                                    </Link>
                                </Td>
                                <Td dataLabel={OverviewColumns.TotalListeners}>
                                    {`${listenerCount}`}
                                </Td>
                                <Td
                                    dataLabel={OverviewColumns.TotalConnectors}
                                >{`${connectorCount}`}</Td>
                                <Td dataLabel={OverviewColumns.NumFLows}>{`${totalFlows}`}</Td>
                                <Td dataLabel={OverviewColumns.NumFLows}>{`${currentFlows}`}</Td>
                            </Tr>
                        </Tbody>
                    ),
                )}
            </TableComposable>
        </Card>
    );
};

export default Overview;
