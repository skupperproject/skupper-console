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
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { MonitorServices } from '../services';
import { QueriesVANServices } from '../services/services.enum';
import { FlowPairBasic } from '../services/services.interfaces';
import { DetailsColumns, CONNECTIONS_PAGINATION_SIZE_DEFAULT } from '../VANServices.constants';
import {
    VanServicesRoutesPathLabel,
    VANServicesRoutesPaths,
    DetailsColumnsNames,
    FlowsPairsLabels,
} from '../VANServices.enum';

import './FlowsPairs.scss';

const FlowsPairs = function () {
    const navigate = useNavigate();
    const { id: vanAddressId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL * 3);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [activeSortIndex, setActiveSortIndex] = useState<number>();
    const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>();

    const [shouldShowActiveFlows, setShouldShowActiveFlows] = useState(true);

    const [visibleItems, setVisibleItems] = useState<number>(CONNECTIONS_PAGINATION_SIZE_DEFAULT);

    const filters = { shouldShowActiveFlows };

    const { data: connectionsPaginated, isLoading } = useQuery(
        [
            QueriesVANServices.GetFlowsPairsByVanAddr,
            vanAddressId,
            currentPage,
            visibleItems,
            filters,
        ],
        () =>
            vanAddressId
                ? MonitorServices.fetchFlowsPairsByVanAddressId(
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
        setCurrentPage(1);
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
        const columnName = DetailsColumns[activeSortIndex || 0].prop as keyof FlowPairBasic;

        const paramA = a[columnName] as string | number;
        const paramB = b[columnName] as string | number;

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
                        <Link to={VANServicesRoutesPaths.VANServices}>
                            {VanServicesRoutesPathLabel.VanServices}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{vanAddressId}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <StackItem>
                <Toolbar>
                    <ToolbarContent>
                        <ToolbarItem>{FlowsPairsLabels.FlowsPairs}</ToolbarItem>
                        <ToolbarGroup alignment={{ default: 'alignRight' }}>
                            <ToolbarItem>
                                <Switch
                                    label={FlowsPairsLabels.ShowActiveFlowsPairs}
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
                                            ![0].includes(index) ? getSortParams(index) : undefined
                                        }
                                    >
                                        {name}
                                        {description && (
                                            <Tooltip content={description}>
                                                <InfoCircleIcon
                                                    color="var(--pf-global--palette--blue-300)"
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
                                        octets,
                                        startTime,
                                        counterFlow,
                                        siteName,
                                        processName,
                                        targetSiteName,
                                        targetProcessName,
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
                                                    `${VANServicesRoutesPaths.FlowsPairs}/${vanAddressId}/${identity}`,
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
                                            <Td dataLabel={DetailsColumnsNames.StartSite}>
                                                {`${siteName}`}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.StartProcess}>
                                                {`${processName}`}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.EndSite}>
                                                {`${targetSiteName || '-'}`}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.EndProcess}>
                                                {`${targetProcessName || '-'}`}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Traffic}>
                                                {formatBytes(octets, 3)}
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

export default FlowsPairs;
