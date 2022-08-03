import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    Pagination,
    Stack,
    StackItem,
    Switch,
    Toolbar,
    ToolbarContent,
    ToolbarGroup,
    ToolbarItem,
    Tooltip,
} from '@patternfly/react-core';
import { CircleIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, ThProps, Tr } from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';
import { ConnectionFlows } from '../services/services.interfaces';
import { DetailsColumns } from '../VANServices.constants';
import {
    MonitoringRoutesPathLabel,
    MonitoringRoutesPaths,
    DetailsColumnsNames,
    ConnectionsLabels,
} from '../VANServices.enum';

import './Connections.scss';

export const MAX_HEIGHT_DETAILS_TABLE = 305;
export const MAX_WIDTH_DETAILS_TABLE = 600;

const PER_PAGE_DEFAULT = 50;

const DetailsView = function () {
    const navigate = useNavigate();
    const { id: vanAddressId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [activeSortIndex, setActiveSortIndex] = useState<number>();
    const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>();

    const [shouldShowActiveFlows, setShouldShowActiveFlows] = useState(true);

    const [visibleItems, setVisibleItems] = useState<number>(PER_PAGE_DEFAULT);

    const filters = { shouldShowActiveFlows };

    const { data: connectionsPaginated, isLoading } = useQuery(
        [
            QueriesMonitoring.GetConnectionsByVanAddr,
            vanAddressId,
            currentPage,
            visibleItems,
            filters,
        ],
        () =>
            vanAddressId
                ? MonitorServices.fetchFlowsByVanAddressId(
                      vanAddressId,
                      currentPage,
                      visibleItems,
                      filters,
                  )
                : null,
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

    function handleSetPage(
        _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
        perPage: number,
    ) {
        setCurrentPage(perPage);
    }

    function handlePerPageSelect(
        _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
        perPageSelect: number,
    ) {
        setVisibleItems(perPageSelect);
    }

    function handleShowActiveFlowsToggle(isChecked: boolean) {
        setShouldShowActiveFlows(isChecked);
        setCurrentPage(1);
    }

    function getSortParams(columnIndex: number): ThProps['sort'] {
        return {
            sortBy: {
                index: activeSortIndex,
                direction: activeSortDirection,
            },
            onSort: (_event: React.MouseEvent, index: number, direction: 'asc' | 'desc') => {
                setActiveSortIndex(index);
                setActiveSortDirection(direction);
            },
            columnIndex,
        };
    }

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!connectionsPaginated) {
        return null;
    }

    const { connections, total } = connectionsPaginated;

    const connectionsSorted = connections.sort((a: any, b: any) => {
        const columnName = DetailsColumns[activeSortIndex || 0].prop as keyof ConnectionFlows;

        let paramA = a[columnName] as string | number;
        let paramB = b[columnName] as string | number;

        if (columnName.includes('target')) {
            const columnNames = columnName.split('.');

            paramA = a[columnNames[0]] && (a[columnNames[0]][columnNames[1]] as string | number);
            paramB = b[columnNames[0]] && (b[columnNames[0]][columnNames[1]] as string | number);
        }

        if (paramA === b[columnName]) {
            return 0;
        }

        if (activeSortIndex && activeSortDirection === 'asc') {
            return paramA > paramB ? 1 : -1;
        }

        return paramA > paramB ? -1 : 1;
    });

    return (
        <Stack hasGutter>
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={MonitoringRoutesPaths.Monitoring}>
                            {MonitoringRoutesPathLabel.Monitoring}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{vanAddressId}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <StackItem>
                <Toolbar>
                    <ToolbarContent>
                        <ToolbarItem>{ConnectionsLabels.Flows}</ToolbarItem>
                        <ToolbarGroup alignment={{ default: 'alignRight' }}>
                            <ToolbarItem>
                                <Switch
                                    label="show active flows"
                                    labelOff="show all flows"
                                    isChecked={shouldShowActiveFlows}
                                    onChange={handleShowActiveFlowsToggle}
                                />
                            </ToolbarItem>
                        </ToolbarGroup>
                    </ToolbarContent>
                </Toolbar>
            </StackItem>
            <StackItem isFilled>
                <Card isFullHeight>
                    {!!connectionsSorted.length && (
                        <Pagination
                            perPageComponent="button"
                            itemCount={total}
                            perPage={visibleItems}
                            page={currentPage}
                            onSetPage={handleSetPage}
                            onPerPageSelect={handlePerPageSelect}
                        />
                    )}
                    <TableComposable variant="compact" borders={true} className="flows-table">
                        <Thead>
                            <Tr>
                                {DetailsColumns.map(({ name, description }, index) => (
                                    <Th
                                        key={name}
                                        sort={
                                            ![0, 1].includes(index)
                                                ? getSortParams(index)
                                                : undefined
                                        }
                                    >
                                        {name}
                                        {description && (
                                            <Tooltip content={description}>
                                                <InfoCircleIcon
                                                    color="var(--pf-global--palette--black-500)"
                                                    className="pf-u-ml-sm"
                                                />
                                            </Tooltip>
                                        )}
                                    </Th>
                                ))}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {!!connections.length &&
                                connectionsSorted.map(
                                    ({
                                        identity,
                                        endTime,
                                        sourceHost,
                                        sourcePort,
                                        octets,
                                        latency,
                                        startTime,
                                        counterFlow,
                                    }) => (
                                        <Tr
                                            className={
                                                counterFlow
                                                    ? 'flow-row'
                                                    : 'flow-no-connection-target-warning'
                                            }
                                            key={identity}
                                            onRowClick={() => {
                                                navigate(
                                                    `${MonitoringRoutesPaths.Connections}/${vanAddressId}/${identity}`,
                                                );
                                            }}
                                        >
                                            <Td>
                                                <CircleIcon
                                                    color={
                                                        endTime
                                                            ? 'var(--pf-global--BackgroundColor--200)'
                                                            : 'var(--pf-global--success-color--100)'
                                                    }
                                                />
                                            </Td>
                                            <Td
                                                dataLabel={DetailsColumnsNames.ConnectionStatus}
                                                width={30}
                                            >
                                                {`${sourceHost}: ${sourcePort}`}{' '}
                                                {!counterFlow &&
                                                    `(${ConnectionsLabels.NoCounterFlowAwailable})`}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Traffic}>
                                                {formatBytes(octets, 3)}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Latency}>
                                                {formatTime(latency)}
                                            </Td>
                                            <Td
                                                dataLabel={DetailsColumnsNames.StartTime}
                                                width={20}
                                            >
                                                {formatDistanceToNow(new Date(startTime / 1000), {
                                                    addSuffix: true,
                                                })}
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
