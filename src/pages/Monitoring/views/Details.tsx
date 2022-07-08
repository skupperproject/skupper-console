import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardTitle,
    Pagination,
    Select,
    SelectOption,
    SelectVariant,
    Stack,
    StackItem,
    Switch,
    Toolbar,
    ToolbarContent,
    ToolbarGroup,
    ToolbarItem,
} from '@patternfly/react-core';
import { CircleIcon, LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import {
    InnerScrollContainer,
    OuterScrollContainer,
    TableComposable,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@patternfly/react-table';
import dayjs from 'dayjs';
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { MonitoringRoutesPathLabel, MonitoringRoutesPaths } from '../Monitoring.enum';
import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';
import { DetailsColumns, Labels } from './Details.enum';

import './Details.scss';

export const MAX_HEIGHT_DETAILS_TABLE = 305;
export const MAX_WIDTH_DETAILS_TABLE = 600;

const PER_PAGE = 50;

const DetailsView = function () {
    const navigate = useNavigate();
    const { id: vanId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [filters, setFilters] = useState({
        directionSelected: '',
        routersSelected: [] as string[],
    });
    const [isDirectionFilterExpanded, setIsDirectionFilterExanded] = useState(false);
    const [isRoutersFilterExpanded, setIsRoutersFilterExanded] = useState(false);
    const [shouldShowActiveFlows, setShouldShowActiveFlows] = useState(true);

    const [visibleItems, setVisibleItems] = useState<number>(PER_PAGE);

    const { data: flows, isLoading } = useQuery(
        [QueriesMonitoring.GetConnectionsByVanAddr, vanId],
        () => (vanId ? MonitorServices.fetchFlowsByVanAddress(vanId) : null),
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

    function handleSetPage(_: any, perPage: number) {
        setCurrentPage(perPage);
    }

    function handlePerPageSelect(_: any, perPageSelect: number) {
        setVisibleItems(perPageSelect);
    }

    function handleDirectionToggle(isExpanded: boolean) {
        setIsDirectionFilterExanded(isExpanded);
    }

    function handleDirectionSelect(_: any, selection: any) {
        setFilters({ ...filters, directionSelected: selection });
        setIsDirectionFilterExanded(false);
        setCurrentPage(1);
    }

    function handleDirectionClear() {
        setFilters({ ...filters, directionSelected: '' });
        setIsDirectionFilterExanded(false);
        setCurrentPage(1);
    }

    function handleRoutersToggle(isExpanded: boolean) {
        setIsRoutersFilterExanded(isExpanded);
    }

    function handleRoutersSelect(_: any, selection: any) {
        const isRouterExist = filters.routersSelected.includes(selection);
        const routersSelected = isRouterExist
            ? filters.routersSelected.filter((filter) => filter !== selection)
            : [...filters.routersSelected, selection];

        setFilters({ ...filters, routersSelected });
        setCurrentPage(1);
    }

    function handleRoutersClear() {
        setFilters({ ...filters, routersSelected: [] });
        setIsRoutersFilterExanded(false);
        setCurrentPage(1);
    }

    function handleShowActiveFlowsToggle(isChecked: boolean) {
        setShouldShowActiveFlows(isChecked);
        setCurrentPage(1);
    }

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!flows) {
        return null;
    }
    const flowsFiltered = flows
        .sort((a, b) => b.startTime - a.startTime)
        .filter(
            (flow) =>
                (flow.device === filters.directionSelected || !filters.directionSelected) &&
                (filters.routersSelected.includes(flow.routerName) ||
                    !filters.routersSelected.length) &&
                !(shouldShowActiveFlows && flow.endTime),
        );

    const flowsPaginated = flowsFiltered.slice(
        visibleItems * (currentPage - 1),
        visibleItems * (currentPage - 1) + visibleItems,
    );

    const routersNames = flows.map(({ routerName }) => routerName);
    const routersNamesOptions = [...new Set(routersNames)];

    return (
        <Stack hasGutter>
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={MonitoringRoutesPaths.Monitoring}>
                            {MonitoringRoutesPathLabel.Monitoring}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{vanId}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <StackItem>
                <Card>
                    <CardTitle>{Labels.Flows}</CardTitle>
                    <Toolbar>
                        <ToolbarContent>
                            <ToolbarItem>
                                <ToolbarGroup>
                                    <ToolbarItem>
                                        <Select
                                            width={220}
                                            variant={SelectVariant.checkbox}
                                            hasPlaceholderStyle
                                            placeholderText="Filter by routers"
                                            onToggle={handleRoutersToggle}
                                            onSelect={handleRoutersSelect}
                                            onClear={handleRoutersClear}
                                            selections={filters.routersSelected}
                                            isOpen={isRoutersFilterExpanded}
                                        >
                                            {routersNamesOptions.map((option, i) => (
                                                <SelectOption key={i} value={option} />
                                            ))}
                                        </Select>
                                    </ToolbarItem>
                                    <ToolbarItem>
                                        <Select
                                            width={200}
                                            variant={SelectVariant.single}
                                            hasPlaceholderStyle
                                            placeholderText="Filter by direction"
                                            onToggle={handleDirectionToggle}
                                            onSelect={handleDirectionSelect}
                                            onClear={handleDirectionClear}
                                            selections={filters.directionSelected}
                                            isOpen={isDirectionFilterExpanded}
                                        >
                                            <SelectOption key={0} value="CONNECTOR">
                                                Incoming
                                            </SelectOption>
                                            <SelectOption key={1} value="LISTENER">
                                                Outgoing
                                            </SelectOption>
                                        </Select>
                                    </ToolbarItem>
                                </ToolbarGroup>
                            </ToolbarItem>
                            <ToolbarItem>
                                <Switch
                                    label="show active flows"
                                    labelOff="show all flows"
                                    isChecked={shouldShowActiveFlows}
                                    onChange={handleShowActiveFlowsToggle}
                                />
                            </ToolbarItem>
                        </ToolbarContent>
                    </Toolbar>
                </Card>
            </StackItem>
            <StackItem isFilled>
                <Card isFullHeight>
                    {!!flowsPaginated.length && (
                        <Pagination
                            perPageComponent="button"
                            itemCount={flowsFiltered.length}
                            perPage={visibleItems}
                            page={currentPage}
                            onSetPage={handleSetPage}
                            onPerPageSelect={handlePerPageSelect}
                        />
                    )}
                    <OuterScrollContainer>
                        <InnerScrollContainer>
                            <TableComposable variant="compact" borders={true} isStriped>
                                <Thead>
                                    <Tr>
                                        <Th>{DetailsColumns.Status}</Th>
                                        <Th>{DetailsColumns.Name}</Th>
                                        <Th>{DetailsColumns.Protocol}</Th>
                                        <Th>{DetailsColumns.Direction}</Th>
                                        <Th>{DetailsColumns.Traffic}</Th>
                                        <Th>{DetailsColumns.Latency}</Th>
                                        <Th>{DetailsColumns.Router}</Th>
                                        <Th>{DetailsColumns.Namespace}</Th>
                                        <Th>{DetailsColumns.CreatedAt}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {!!flows.length &&
                                        flowsPaginated.map(
                                            ({
                                                id,
                                                sourceHost,
                                                sourcePort,
                                                endTime,
                                                device,
                                                parent,
                                                octets,
                                                latency,
                                                routerName,
                                                protocol,
                                                namespace,
                                                startTime,
                                            }) => (
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
                                                    <Td dataLabel={DetailsColumns.Port}>
                                                        <Link
                                                            to={`${MonitoringRoutesPaths.Connections}/${vanId}${MonitoringRoutesPaths.ConnectionsTopology}/${parent}/${id}`}
                                                        >
                                                            {sourceHost}: {sourcePort}
                                                        </Link>
                                                    </Td>
                                                    <Td dataLabel={DetailsColumns.Protocol}>
                                                        {protocol}
                                                    </Td>
                                                    <Td dataLabel={DetailsColumns.Direction}>
                                                        {device === 'LISTENER' ? (
                                                            <>
                                                                <LongArrowAltUpIcon color="var(--pf-global--palette--blue-200)" />
                                                                {'Outgoing'}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LongArrowAltDownIcon color="var(--pf-global--palette--red-200)" />
                                                                {'Incoming'}
                                                            </>
                                                        )}
                                                    </Td>
                                                    <Td dataLabel={DetailsColumns.Traffic}>
                                                        {formatBytes(octets, 3)}
                                                    </Td>
                                                    <Td dataLabel={DetailsColumns.Latency}>
                                                        {formatTime(latency)}
                                                    </Td>
                                                    <Td dataLabel={DetailsColumns.Router}>
                                                        {routerName}
                                                    </Td>
                                                    <Td dataLabel={DetailsColumns.Namespace}>
                                                        {namespace}
                                                    </Td>
                                                    <Td dataLabel={DetailsColumns.CreatedAt}>
                                                        {dayjs(startTime).format('YYYY-MM-DD')}
                                                    </Td>
                                                </Tr>
                                            ),
                                        )}
                                </Tbody>
                            </TableComposable>
                        </InnerScrollContainer>
                    </OuterScrollContainer>
                </Card>
            </StackItem>
        </Stack>
    );
};

export default DetailsView;
