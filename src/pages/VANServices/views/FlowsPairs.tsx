import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    Flex,
    Pagination,
    Stack,
    StackItem,
    Text,
    TextContent,
    TextVariants,
} from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, ThProps, Tr } from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
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
} from '../VANServices.enum';

import './FlowsPairs.css';

const FlowsPairs = function () {
    const navigate = useNavigate();
    const { id: vanAddress } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL * 3);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [activeSortIndex, setActiveSortIndex] = useState<number>();
    const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>();

    const [visibleItems, setVisibleItems] = useState<number>(CONNECTIONS_PAGINATION_SIZE_DEFAULT);

    const vanAddressId = vanAddress?.split('@')[1];
    const vanAddressName = vanAddress?.split('@')[0];

    const { data: connectionsPaginated, isLoading } = useQuery(
        [QueriesVANServices.GetFlowsPairsByVanAddr, vanAddressId, currentPage, visibleItems],
        () =>
            vanAddressId
                ? MonitorServices.fetchFlowsPairsByVanAddressId(
                      vanAddressId,
                      currentPage,
                      visibleItems,
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

        if (activeSortDirection === 'asc') {
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
                    <BreadcrumbHeading to="#">{vanAddressName}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <StackItem>
                <Flex>
                    <ResourceIcon type="vanAddress" />
                    <TextContent>
                        <Text component={TextVariants.h1}>{vanAddressName}</Text>
                    </TextContent>
                </Flex>
            </StackItem>
            <StackItem isFilled>
                <Card isRounded className="pf-u-pt-md">
                    <TableComposable variant="compact" borders={true} className="flows-table">
                        <Thead hasNestedHeader>
                            <Tr>
                                <Th hasRightBorder colSpan={6}>
                                    {DetailsColumnsNames.FlowForward}
                                </Th>
                                <Th colSpan={6} hasRightBorder>
                                    {DetailsColumnsNames.FlowReverse}
                                </Th>
                                <Th modifier="fitContent" rowSpan={2}>
                                    {DetailsColumnsNames.Protocol}
                                </Th>
                            </Tr>
                            <Tr>
                                <Th isSubheader sort={getSortParams(0)}>
                                    {DetailsColumnsNames.Site}
                                </Th>
                                <Th isSubheader sort={getSortParams(1)}>
                                    {DetailsColumnsNames.Host}
                                </Th>
                                <Th isSubheader sort={getSortParams(2)}>
                                    {DetailsColumnsNames.Port}
                                </Th>
                                <Th isSubheader sort={getSortParams(3)}>
                                    {DetailsColumnsNames.Process}
                                </Th>
                                <Th isSubheader className="align-th-right" sort={getSortParams(4)}>
                                    {DetailsColumnsNames.ByteRate}
                                </Th>
                                <Th
                                    isSubheader
                                    className="align-th-right"
                                    sort={getSortParams(5)}
                                    hasRightBorder
                                >
                                    {DetailsColumnsNames.Bytes}
                                </Th>
                                <Th isSubheader sort={getSortParams(6)}>
                                    {DetailsColumnsNames.Site}
                                </Th>
                                <Th isSubheader sort={getSortParams(7)}>
                                    {DetailsColumnsNames.Host}
                                </Th>
                                <Th isSubheader sort={getSortParams(8)}>
                                    {DetailsColumnsNames.Port}
                                </Th>
                                <Th isSubheader sort={getSortParams(9)}>
                                    {DetailsColumnsNames.Process}
                                </Th>
                                <Th isSubheader className="align-th-right" sort={getSortParams(10)}>
                                    {DetailsColumnsNames.ByteRate}
                                </Th>
                                <Th
                                    isSubheader
                                    className="align-th-right"
                                    sort={getSortParams(11)}
                                    hasRightBorder
                                >
                                    {DetailsColumnsNames.Bytes}
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {!!connections.length &&
                                connectionsSorted.map(
                                    ({
                                        id,
                                        bytes,
                                        byteRate,
                                        host,
                                        port,
                                        siteName,
                                        processName,
                                        targetSiteName,
                                        targetByteRate,
                                        targetBytes,
                                        targetHost,
                                        targetProcessName,
                                        targetPort,
                                        protocol,
                                    }) => (
                                        <Tr key={id}>
                                            <Td
                                                dataLabel={DetailsColumnsNames.Site}
                                                className="secondary-color"
                                            >
                                                {`${siteName}`}
                                            </Td>
                                            <Td
                                                dataLabel={DetailsColumnsNames.Host}
                                                className="secondary-color"
                                            >
                                                {host}
                                            </Td>
                                            <Td
                                                dataLabel={DetailsColumnsNames.Port}
                                                className="secondary-color"
                                            >
                                                {port}
                                            </Td>
                                            <Td
                                                dataLabel={DetailsColumnsNames.Process}
                                                className="secondary-color"
                                            >
                                                {`${processName}`}
                                            </Td>
                                            <Td
                                                dataLabel={DetailsColumnsNames.Bytes}
                                                className="align-td-right secondary-color"
                                            >
                                                {formatBytes(byteRate, 3)}
                                            </Td>
                                            <Td
                                                dataLabel={DetailsColumnsNames.Bytes}
                                                className="align-td-right secondary-color"
                                            >
                                                {formatBytes(bytes, 3)}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Site}>
                                                {`${targetSiteName}`}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Host}>
                                                {targetHost}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Port}>
                                                {targetPort}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Process}>
                                                {`${targetProcessName}`}
                                            </Td>
                                            <Td
                                                dataLabel={DetailsColumnsNames.Bytes}
                                                className="align-td-right"
                                            >
                                                {formatBytes(targetByteRate, 3)}
                                            </Td>
                                            <Td
                                                dataLabel={DetailsColumnsNames.Bytes}
                                                className="align-td-right"
                                            >
                                                {formatBytes(targetBytes, 3)}
                                            </Td>
                                            <Td dataLabel={DetailsColumnsNames.Protocol}>
                                                {protocol}
                                            </Td>
                                        </Tr>
                                    ),
                                )}
                        </Tbody>
                    </TableComposable>
                    {!!connectionsSorted.length && (
                        <Pagination
                            className="pf-u-my-xs"
                            perPageComponent="button"
                            itemCount={total}
                            perPage={visibleItems}
                            page={currentPage}
                            onSetPage={handleSetPage}
                            onPerPageSelect={handlePerPageSelect}
                        />
                    )}
                </Card>
            </StackItem>
        </Stack>
    );
};

export default FlowsPairs;
