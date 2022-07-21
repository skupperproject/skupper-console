import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardTitle,
    Label,
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
import { TableComposable, Tbody, Td, Th, Thead, ThProps, Tr } from '@patternfly/react-table';
import { formatDistanceToNow } from 'date-fns';
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
import { FlowExtended } from '../services/services.interfaces';
import { DetailsColumns } from './Details.constants';
import { DetailsColumnsNames, Labels } from './Details.enum';

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
        sitesSelected: [] as string[],
        sitesSelectedTarget: [] as string[],
        routersSelected: [] as string[],
        routersSelectedTarget: [] as string[],
    });
    const [isDirectionFilterExpanded, setIsDirectionFilterExanded] = useState(false);
    const [isRoutersFilterExpanded, setIsRoutersFilterExanded] = useState(false);
    const [isRoutersFilterTargetExpanded, setIsRoutersFilterTargetExanded] = useState(false);
    const [isSitesFilterExpanded, setIsSitesFilterExanded] = useState(false);
    const [isSitesFilterTargetExpanded, setIsSitesFilterTargetExanded] = useState(false);

    const [activeSortIndex, setActiveSortIndex] = useState<number>();
    const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>();

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

    function handleSitesToggle(isExpanded: boolean) {
        setIsSitesFilterExanded(isExpanded);
    }

    function handleSitesToggleTarget(isExpanded: boolean) {
        setIsSitesFilterTargetExanded(isExpanded);
    }

    function handleRoutersToggle(isExpanded: boolean) {
        setIsRoutersFilterExanded(isExpanded);
    }

    function handleRoutersToggleTarget(isExpanded: boolean) {
        setIsRoutersFilterTargetExanded(isExpanded);
    }

    function handleSitesSelect(_: any, selection: any) {
        const selected = filters.sitesSelected.includes(selection)
            ? filters.sitesSelected.filter((filter) => filter !== selection)
            : [...filters.sitesSelected, selection];

        setFilters({ ...filters, sitesSelected: selected });
        setCurrentPage(1);
    }

    function handleSitesSelectTarget(_: any, selection: any) {
        const selected = filters.sitesSelectedTarget.includes(selection)
            ? filters.sitesSelectedTarget.filter((filter) => filter !== selection)
            : [...filters.sitesSelectedTarget, selection];

        setFilters({ ...filters, sitesSelectedTarget: selected });
        setCurrentPage(1);
    }

    function handleRoutersSelect(_: any, selection: any) {
        const routersSelected = filters.routersSelected.includes(selection)
            ? filters.routersSelected.filter((filter) => filter !== selection)
            : [...filters.routersSelected, selection];

        setFilters({ ...filters, routersSelected });
        setCurrentPage(1);
    }

    function handleRoutersSelectTarget(_: any, selection: any) {
        const isRouterExist = filters.routersSelectedTarget.includes(selection);
        const routersSelectedTarget = isRouterExist
            ? filters.routersSelectedTarget.filter((filter) => filter !== selection)
            : [...filters.routersSelectedTarget, selection];

        setFilters({ ...filters, routersSelectedTarget });
        setCurrentPage(1);
    }

    function handleSitesClear() {
        setFilters({ ...filters, sitesSelected: [] });
        setIsRoutersFilterExanded(false);
        setCurrentPage(1);
    }

    function handleSitesTargetClear() {
        setFilters({ ...filters, sitesSelectedTarget: [] });
        setIsRoutersFilterExanded(false);
        setCurrentPage(1);
    }

    function handleRoutersClear() {
        setFilters({ ...filters, routersSelected: [] });
        setIsRoutersFilterExanded(false);
        setCurrentPage(1);
    }

    function handleRoutersTargetsClear() {
        setFilters({ ...filters, routersSelectedTarget: [] });
        setIsRoutersFilterTargetExanded(false);
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
            onSort: (_event: any, index: number, direction: 'asc' | 'desc') => {
                setActiveSortIndex(index);
                setActiveSortDirection(direction);
            },
            columnIndex,
        };
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
                (filters.sitesSelected.includes(flow.namespace) || !filters.sitesSelected.length) &&
                (filters.sitesSelectedTarget.includes(flow.target?.namespace) ||
                    !filters.sitesSelectedTarget.length) &&
                (filters.routersSelected.includes(flow.routerName) ||
                    !filters.routersSelected.length) &&
                (filters.routersSelectedTarget.includes(flow.target?.routerName) ||
                    !filters.routersSelectedTarget.length) &&
                !(shouldShowActiveFlows && flow.endTime),
        );

    const flowsSorted = !activeSortDirection
        ? flowsFiltered
        : flowsFiltered.sort((a: FlowExtended, b: FlowExtended) => {
              const columnName = DetailsColumns[activeSortIndex || 0].prop as keyof FlowExtended;

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

    const flowsPaginated = flowsSorted.slice(
        visibleItems * (currentPage - 1),
        visibleItems * (currentPage - 1) + visibleItems,
    );

    const sitesNames = flows.map(({ namespace }) => namespace);
    const sitesNamesNamesOptions = [...new Set(sitesNames)];

    const routersNames = flows
        .filter(
            (flow) =>
                !filters.sitesSelected.length || filters.sitesSelected.includes(flow.namespace),
        )
        .map(({ routerName }) => routerName);
    const routersNamesOptions = [...new Set(routersNames)];

    const routersNamesTarget = flows
        .filter(
            (flow) =>
                !filters.sitesSelectedTarget.length ||
                filters.sitesSelectedTarget.includes(flow.namespace),
        )
        .map(({ routerName }) => routerName);
    const routersNamesOptionsTarget = [...new Set(routersNamesTarget)];

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
                            <ToolbarGroup alignment={{ default: 'alignLeft' }}>
                                <ToolbarItem>
                                    <Select
                                        width={250}
                                        variant={SelectVariant.checkbox}
                                        hasPlaceholderStyle
                                        placeholderText="From site"
                                        onToggle={handleSitesToggle}
                                        onSelect={handleSitesSelect}
                                        onClear={handleSitesClear}
                                        selections={filters.sitesSelected}
                                        isOpen={isSitesFilterExpanded}
                                    >
                                        {sitesNamesNamesOptions.map((option, i) => (
                                            <SelectOption key={i} value={option} />
                                        ))}
                                    </Select>
                                    <Select
                                        width={250}
                                        variant={SelectVariant.checkbox}
                                        hasPlaceholderStyle
                                        placeholderText="From routers"
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
                                        width={250}
                                        variant={SelectVariant.checkbox}
                                        hasPlaceholderStyle
                                        placeholderText="To site"
                                        onToggle={handleSitesToggleTarget}
                                        onSelect={handleSitesSelectTarget}
                                        onClear={handleSitesTargetClear}
                                        selections={filters.sitesSelectedTarget}
                                        isOpen={isSitesFilterTargetExpanded}
                                    >
                                        {sitesNamesNamesOptions.map((option, i) => (
                                            <SelectOption key={i} value={option} />
                                        ))}
                                    </Select>
                                    <Select
                                        width={250}
                                        variant={SelectVariant.checkbox}
                                        hasPlaceholderStyle
                                        placeholderText="To routers"
                                        onToggle={handleRoutersToggleTarget}
                                        onSelect={handleRoutersSelectTarget}
                                        onClear={handleRoutersTargetsClear}
                                        selections={filters.routersSelectedTarget}
                                        isOpen={isRoutersFilterTargetExpanded}
                                    >
                                        {routersNamesOptionsTarget.map((option, i) => (
                                            <SelectOption key={i} value={option} />
                                        ))}
                                    </Select>
                                </ToolbarItem>

                                <ToolbarItem>
                                    <Select
                                        width={200}
                                        variant={SelectVariant.single}
                                        hasPlaceholderStyle
                                        placeholderText="Flow direction"
                                        onToggle={handleDirectionToggle}
                                        onSelect={handleDirectionSelect}
                                        onClear={handleDirectionClear}
                                        selections={filters.directionSelected || undefined}
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
                    <TableComposable variant="compact" borders={true} className="flows-table">
                        <Thead>
                            <Tr>
                                {DetailsColumns.map(({ name }, index) => (
                                    <Th
                                        key={name}
                                        sort={
                                            ![0, 3, 4, 6].includes(index)
                                                ? getSortParams(index)
                                                : undefined
                                        }
                                    >
                                        {' '}
                                        {name}
                                    </Th>
                                ))}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {!!flows.length &&
                                flowsPaginated.map(
                                    ({
                                        id,
                                        endTime,
                                        device,
                                        parent,
                                        octets,
                                        latency,
                                        routerName,
                                        protocol,
                                        namespace,
                                        target,
                                        startTime,
                                    }) => (
                                        <Tr
                                            key={id}
                                            onRowClick={() => {
                                                navigate(
                                                    `${MonitoringRoutesPaths.Connections}/${vanId}${MonitoringRoutesPaths.ConnectionsTopology}/${parent}/${id}`,
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
                                            <Td dataLabel={DetailsColumnsNames.Site}>
                                                <Label
                                                    color={device === 'LISTENER' ? 'blue' : 'red'}
                                                >
                                                    {namespace}
                                                </Label>
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Router}>
                                                {routerName}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.TargetSite}>
                                                {target?.namespace && (
                                                    <Label
                                                        color={
                                                            target?.device === 'LISTENER'
                                                                ? 'blue'
                                                                : 'red'
                                                        }
                                                    >
                                                        {target.namespace}
                                                    </Label>
                                                )}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.TargetRouter}>
                                                {target?.routerName}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Direction}>
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
                                            <Td dataLabel={DetailsColumnsNames.Protocol}>
                                                {protocol}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Traffic}>
                                                {formatBytes(octets, 3)}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Latency}>
                                                {formatTime(latency)}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.StartTime}>
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
