import React, { useCallback, useEffect, useState } from 'react';

import {
    Bullseye,
    Card,
    CardTitle,
    EmptyState,
    EmptyStateBody,
    EmptyStateIcon,
    EmptyStateVariant,
    Stack,
    StackItem,
    Title,
    Tooltip,
} from '@patternfly/react-core';
import {
    CircleIcon,
    ArrowRightIcon,
    ConnectedIcon,
    PluggedIcon,
    InfoCircleIcon,
    SearchIcon,
} from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { MonitoringRoutesPaths } from '../Monitoring.enum';
import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';
import { DetailsColumns, Labels } from './Details.enum';

import './Details.scss';

export const MAX_HEIGHT_DETAILS_TABLE = 305;
export const MAX_WIDTH_DETAILS_TABLE = 600;

const DetailsView = function () {
    const navigate = useNavigate();
    const { id: vanId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [devicesSelected, setIdDevicesSelected] = useState<string[]>([]);

    const { data: connections, isLoading } = useQuery(
        [QueriesMonitoring.GetConnectionsByVanAddr, vanId],
        () => (vanId ? MonitorServices.fetchConnectionsByVanAddr(vanId) : null),
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

    const { devices, flows } = connections;

    const flowsSelected = flows
        .map((flow) => ({ ...flow, device: devices.find(({ id }) => id === flow.parent) }))
        .filter(({ parent }) => devicesSelected.includes(parent));

    return (
        <Stack hasGutter>
            <StackItem>
                <Card>
                    <CardTitle>{Labels.Devices}</CardTitle>
                    <TableComposable variant="compact" borders={false} className="flow-devices">
                        <Thead>
                            <Tr>
                                <Th>{DetailsColumns.Type}</Th>
                                <Th>{DetailsColumns.Name}</Th>
                                <Th>{DetailsColumns.Protocol}</Th>
                                <Th>{DetailsColumns.Router}</Th>
                                <Th>{DetailsColumns.Namespace}</Th>
                                <Th>{DetailsColumns.DestinationHost}</Th>
                                <Th>{DetailsColumns.DestinationPort}</Th>
                            </Tr>
                        </Thead>
                        {devices?.map(
                            ({
                                id,
                                protocol,
                                name,
                                routerName,
                                namespace,
                                destHost,
                                destPort,
                                rtype,
                            }) => (
                                <Tbody key={id}>
                                    <Tr
                                        onClick={() => handleRowClick(id)}
                                        className={handleSelectRow(id)}
                                    >
                                        <Td dataLabel={DetailsColumns.Type}>
                                            <Tooltip
                                                content={rtype === 'LISTENER' ? 'SERVER' : 'CLIENT'}
                                            >
                                                {rtype === 'LISTENER' ? (
                                                    <ConnectedIcon />
                                                ) : (
                                                    <PluggedIcon />
                                                )}
                                            </Tooltip>
                                        </Td>
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
                                <Th>{DetailsColumns.Name}</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {!flowsSelected.length && (
                                <Tr>
                                    <Td colSpan={8}>
                                        <Bullseye>
                                            <EmptyState variant={EmptyStateVariant.small}>
                                                <EmptyStateIcon
                                                    icon={
                                                        !devicesSelected.length
                                                            ? InfoCircleIcon
                                                            : SearchIcon
                                                    }
                                                    color="var(--pf-global--palette--blue-300)"
                                                />
                                                <EmptyStateBody>
                                                    <Title headingLevel="h4" size="md">
                                                        {!devicesSelected.length
                                                            ? Labels.NoFlows
                                                            : Labels.NoResult}
                                                    </Title>
                                                </EmptyStateBody>
                                            </EmptyState>
                                        </Bullseye>
                                    </Td>
                                </Tr>
                            )}
                            {!!flowsSelected.length &&
                                flowsSelected.map(
                                    ({ id, sourceHost, sourcePort, endTime, device, parent }) => (
                                        <Tr key={id}>
                                            <Td>
                                                <CircleIcon
                                                    color={
                                                        endTime
                                                            ? 'var(--pf-global--BackgroundColor--200)'
                                                            : 'var(--pf-global--success-color--100)'
                                                    }
                                                />
                                            </Td>
                                            <Td dataLabel={DetailsColumns.IP}>
                                                <Link
                                                    to={`${MonitoringRoutesPaths.Connections}/${vanId}${MonitoringRoutesPaths.ConnectionsTopology}/${parent}/${id}`}
                                                >
                                                    {sourceHost}
                                                </Link>
                                            </Td>
                                            <Td dataLabel={DetailsColumns.Port}>{sourcePort}</Td>
                                            <Td dataLabel={DetailsColumns.Namespace}>
                                                <Tooltip content={device?.rtype}>
                                                    {device?.rtype === 'LISTENER' ? (
                                                        <ConnectedIcon />
                                                    ) : (
                                                        <PluggedIcon />
                                                    )}
                                                </Tooltip>{' '}
                                                {device?.name}
                                            </Td>
                                        </Tr>
                                    ),
                                )}
                        </Tbody>
                    </TableComposable>
                </Card>
            </StackItem>
        </Stack>
    );
};

export default DetailsView;
