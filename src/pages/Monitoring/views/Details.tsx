import React, { useCallback, useEffect, useState } from 'react';

import { Card, CardTitle, Stack, StackItem } from '@patternfly/react-core';
import { CircleIcon, ArrowRightIcon, ConnectedIcon, PluggedIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';
import { DetailsColumns, Labels } from './Details.enum';

import './Details.scss';

export const MAX_WIDTH_DETAILS_TABLE = 600;
export const MAX_HEIGHT_DETAILS_TABLE = 305;

const DetailsView = function () {
    const navigate = useNavigate();
    const { id: vanId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [devicesSelected, setIdDevicesSelected] = useState<string[]>([]);

    const { data: connections, isLoading } = useQuery(
        [QueriesMonitoring.GetConnectionsByVanAddr, vanId],
        () => MonitorServices.fetchConnectionsByVanAddr(vanId),
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

    const handleSelectRow = useCallback(
        (id: string) => {
            const isIdSelected = devicesSelected.includes(id);

            if (isIdSelected) {
                return 'selected cursor-pointer';
            }

            return 'cursor-pointer';
        },
        [devicesSelected],
    );

    const handleRowClick = useCallback(
        (id: string) => {
            const isIdSelected = devicesSelected.includes(id);

            if (isIdSelected) {
                setIdDevicesSelected(
                    devicesSelected.filter((deviceSelected) => deviceSelected !== id),
                );

                return;
            }

            setIdDevicesSelected([...devicesSelected, id]);
        },
        [devicesSelected],
    );

    useEffect(() => () => setRefetchInterval(0), []);

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!connections) {
        return null;
    }

    const listeners = connections.listeners;
    const connectors = connections.connectors;
    const flows = connections.flows;

    return (
        <Stack hasGutter>
            <StackItem>
                <Card>
                    <CardTitle>
                        <ConnectedIcon /> {Labels.Listeners}
                    </CardTitle>
                    <TableComposable variant="compact" borders={false}>
                        <Thead>
                            <Tr>
                                <Th>{DetailsColumns.Name}</Th>
                                <Th>{DetailsColumns.Protocol}</Th>
                                <Th>{DetailsColumns.Router}</Th>
                                <Th>{DetailsColumns.Namespace}</Th>
                                <Th>{DetailsColumns.DestinationHost}</Th>
                                <Th>{DetailsColumns.DestinationPort}</Th>
                            </Tr>
                        </Thead>
                        {listeners?.map(
                            ({ id, protocol, name, routerName, namespace, destHost, destPort }) => (
                                <Tbody key={id}>
                                    <Tr
                                        onClick={() => handleRowClick(id)}
                                        className={handleSelectRow(id)}
                                    >
                                        <Td dataLabel={DetailsColumns.Name}>{name}</Td>
                                        <Td dataLabel={DetailsColumns.Protocol}>{protocol}</Td>
                                        <Td dataLabel={DetailsColumns.Router}>{routerName}</Td>
                                        <Td dataLabel={DetailsColumns.Namespace}>{namespace}</Td>
                                        <Td dataLabel={DetailsColumns.DestinationHost}>
                                            {destHost}
                                        </Td>
                                        <Td dataLabel={DetailsColumns.DestinationPort}>
                                            {destPort}
                                        </Td>
                                    </Tr>
                                </Tbody>
                            ),
                        )}
                    </TableComposable>
                </Card>
            </StackItem>

            <StackItem>
                <Card>
                    <CardTitle>
                        <PluggedIcon /> {Labels.Connectors}
                    </CardTitle>
                    <TableComposable variant="compact" borders={false}>
                        <Thead>
                            <Tr>
                                <Th>{DetailsColumns.Name}</Th>
                                <Th>{DetailsColumns.Protocol}</Th>
                                <Th>{DetailsColumns.Router}</Th>
                                <Th>{DetailsColumns.Namespace}</Th>
                                <Th>{DetailsColumns.DestinationHost}</Th>
                                <Th>{DetailsColumns.DestinationPort}</Th>
                            </Tr>
                        </Thead>
                        {connectors?.map(
                            ({ id, protocol, name, routerName, namespace, destHost, destPort }) => (
                                <Tbody key={id}>
                                    <Tr
                                        onClick={() => handleRowClick(id)}
                                        className={handleSelectRow(id)}
                                    >
                                        <Td dataLabel={DetailsColumns.Name}>{name}</Td>
                                        <Td dataLabel={DetailsColumns.Protocol}>{protocol}</Td>
                                        <Td dataLabel={DetailsColumns.Router}>{routerName}</Td>
                                        <Td dataLabel={DetailsColumns.Namespace}>{namespace}</Td>
                                        <Td dataLabel={DetailsColumns.Protocol}>{destHost}</Td>
                                        <Td dataLabel={DetailsColumns.Protocol}>{destPort}</Td>
                                    </Tr>
                                </Tbody>
                            ),
                        )}
                    </TableComposable>
                </Card>
            </StackItem>
            <StackItem className="pf-u-mt-xl">
                <Card>
                    <CardTitle>
                        <ArrowRightIcon /> {Labels.Flows}
                    </CardTitle>
                    <TableComposable variant="compact" borders={false}>
                        <Thead>
                            <Tr>
                                <Th>{DetailsColumns.Status}</Th>
                                <Th>{DetailsColumns.IP}</Th>
                                <Th>{DetailsColumns.Port}</Th>
                                <Th>{DetailsColumns.Traffic}</Th>
                                <Th>{DetailsColumns.Latency}</Th>
                            </Tr>
                        </Thead>
                        {flows
                            .filter(({ parent }) => devicesSelected.includes(parent))
                            .map(({ id, latency, octets, sourceHost, sourcePort, endTime }) => (
                                <Tbody key={id}>
                                    <Tr>
                                        <Td>
                                            <CircleIcon
                                                color={
                                                    endTime
                                                        ? 'var(--pf-global--BackgroundColor--200)'
                                                        : 'var(--pf-global--success-color--100)'
                                                }
                                            />
                                        </Td>
                                        <Td dataLabel={DetailsColumns.IP}>{sourceHost}</Td>
                                        <Td dataLabel={DetailsColumns.Port}>{sourcePort}</Td>
                                        <Td dataLabel={DetailsColumns.Traffic}>
                                            {formatBytes(octets)}
                                        </Td>
                                        <Td dataLabel={DetailsColumns.Latency}>
                                            {formatTime(latency)}
                                        </Td>
                                    </Tr>
                                </Tbody>
                            ))}
                    </TableComposable>
                </Card>
            </StackItem>
        </Stack>
    );
};

export default DetailsView;
