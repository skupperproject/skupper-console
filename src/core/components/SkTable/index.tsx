import React, { useCallback, useState } from 'react';

import {
    Card,
    CardTitle,
    Flex,
    Pagination,
    Text,
    TextContent,
    TextVariants,
    Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import {
    TableComposable,
    TableText,
    Tbody,
    Td,
    Th,
    Thead,
    ThProps,
    Tr,
} from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';

import { generateUUID } from '@core/utils/generateUUID';
import { HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { axiosFetch } from 'API/axiosMiddleware';
import { getResults } from 'API/REST';
import { SortDirection } from 'API/REST.enum';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import { SKTableProps } from './SkTable.interfaces';

const FIRST_PAGE_NUMBER = 1;

function getProperty(obj: any, prop: any) {
    if (!prop) {
        return {};
    }

    const parts = prop.split('.');

    if (parts.length === 1) {
        return obj[prop];
    }

    if (Array.isArray(parts)) {
        const last = parts.pop();
        const l = parts.length;
        let i = 1;
        let current = parts[0];

        while ((obj = obj[current]) && i < l) {
            current = parts[i];
            i++;
        }

        if (obj) {
            return obj[last];
        }
    } else {
        throw 'parts is not valid array';
    }
}

const SkTable = function <T>({
    title,
    titleDescription,
    columns,
    rows = [],
    rowsCount = rows.length,
    components,
    urlPagination = '',
    onGetFilters,
    onError,
    pageSizeStart,
    ...props
}: SKTableProps<T>) {
    // sort
    const [activeSortIndex, setActiveSortIndex] = useState<number>();
    const [activeSortDirection, setActiveSortDirection] = useState<SortDirection>();
    // pagination
    const [currentPageNumber, setCurrentPageNumber] = useState<number>(FIRST_PAGE_NUMBER);
    const [pageSize, setPageSize] = useState<number>(pageSizeStart || DEFAULT_TABLE_PAGE_SIZE);

    const { data: page } = useQuery({
        queryKey: [
            urlPagination, // name of the query
            currentPageNumber,
            pageSize,
            activeSortIndex,
            activeSortDirection,
        ],
        queryFn: () =>
            fetchRows(currentPageNumber - 1, pageSize, activeSortIndex, activeSortDirection),
        keepPreviousData: true,
        onError: handleError,
        enabled: !!urlPagination,
    });

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        if (onError) {
            onError(httpStatus);
        }
    }

    const fetchRows = async (
        offset: number,
        limit: number,
        sortColumnIndex?: number,
        sortColumnDirection?: SortDirection,
    ) => {
        const prop =
            sortColumnIndex !== undefined
                ? columns[sortColumnIndex].prop?.toString().split('.')
                : undefined;

        const { data } = await axiosFetch(urlPagination || '', {
            params: {
                offset: offset * limit,
                limit,
                sortBy:
                    prop !== undefined ? `${prop[prop?.length - 1]}.${sortColumnDirection}` : null,
            },
        });

        return data;
    };

    const getSortParams = useCallback(
        (columnIndex: number): ThProps['sort'] => ({
            sortBy: {
                index: activeSortIndex,
                direction: activeSortDirection,
            },
            onSort: (_event: React.MouseEvent, index: number, direction: 'asc' | 'desc') => {
                if (onGetFilters) {
                    onGetFilters({
                        limit: pageSize,
                        offset: (currentPageNumber - 1) * pageSize,
                        sortName: index !== undefined && columns[index].prop,
                        sortDirection: direction,
                    });
                }

                setActiveSortIndex(index);
                setActiveSortDirection(direction as SortDirection);
            },
            columnIndex,
        }),
        [activeSortDirection, activeSortIndex, columns, currentPageNumber, pageSize, onGetFilters],
    );

    function handleSetPageNumber(
        _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
        pageNumber: number,
    ) {
        if (onGetFilters) {
            onGetFilters({
                limit: pageSize,
                offset: pageNumber - 1 * pageSize,
                sortName: activeSortIndex !== undefined && columns[activeSortIndex].prop,
                sortDirection: activeSortDirection,
            });
        }

        setCurrentPageNumber(pageNumber);
    }

    function handleSetPageSize(
        _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
        pageSizeSelected: number,
    ) {
        setPageSize(pageSizeSelected);
        setCurrentPageNumber(FIRST_PAGE_NUMBER);
    }

    const totalRows = page ? page.totalCount : rowsCount;
    let rowsSorted = page ? (getResults(page) as T[]) || [] : rows;

    rowsSorted = rowsSorted.sort((a, b) => {
        const columnName = columns[activeSortIndex || 0].prop as keyof T;

        const paramA = a[columnName];
        const paramB = b[columnName];

        if (paramA === paramB) {
            return 0;
        }

        if (activeSortDirection === 'asc') {
            return paramA > paramB ? 1 : -1;
        }

        if (activeSortDirection === 'desc') {
            return paramA < paramB ? 1 : -1;
        }

        return 0;
    });

    let skRows = rowsSorted.map((row) => ({
        id: generateUUID(),
        columns: columns.map((column) => ({
            ...column,
            data: row,
            value: getProperty(row, column.prop),
        })),
    }));

    if (!urlPagination && !onGetFilters && pageSizeStart) {
        skRows = skRows.slice(
            (currentPageNumber - 1) * pageSize,
            (currentPageNumber - 1) * pageSize + pageSize,
        );
    }

    const { isPlain = false, shouldSort = true, ...restProps } = props;

    return (
        <Card isPlain={isPlain}>
            {title && (
                <CardTitle>
                    <Flex>
                        {title && (
                            <TextContent>
                                <Text component={TextVariants.h1}>{title}</Text>
                            </TextContent>
                        )}
                        {titleDescription && (
                            <Tooltip position="right" content={titleDescription}>
                                <OutlinedQuestionCircleIcon />
                            </Tooltip>
                        )}
                    </Flex>
                </CardTitle>
            )}
            <TableComposable
                borders={false}
                variant="compact"
                isStickyHeader
                isStriped
                {...restProps}
            >
                <Thead>
                    <Tr>
                        {columns.map(({ name, prop }, index) => (
                            <Th
                                key={name}
                                sort={(prop && shouldSort && getSortParams(index)) || undefined}
                            >
                                {name}
                            </Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {skRows.map((row) => (
                        <Tr key={row.id}>
                            {row.columns.map(
                                ({ data, value, component, callback, format, width }) => {
                                    const Component =
                                        components && component && components[component];

                                    return Component ? (
                                        <Td
                                            width={
                                                width as
                                                    | 10
                                                    | 15
                                                    | 20
                                                    | 25
                                                    | 30
                                                    | 35
                                                    | 40
                                                    | 45
                                                    | 50
                                                    | 60
                                                    | 70
                                                    | 80
                                                    | 90
                                                    | 100
                                                    | undefined
                                            }
                                            key={generateUUID()}
                                        >
                                            <Component
                                                data={data}
                                                value={value}
                                                callback={callback}
                                                format={format && format(value)}
                                            />
                                        </Td>
                                    ) : (
                                        <Td key={generateUUID()}>
                                            <TableText wrapModifier="truncate">
                                                {(format && format(value)) || (value as string)}
                                            </TableText>
                                        </Td>
                                    );
                                },
                            )}
                        </Tr>
                    ))}
                </Tbody>
            </TableComposable>
            {(pageSizeStart || urlPagination || onGetFilters) && (
                <Pagination
                    className="pf-u-my-xs"
                    perPageComponent="button"
                    itemCount={totalRows}
                    perPage={pageSize}
                    page={currentPageNumber}
                    onSetPage={handleSetPageNumber}
                    onPerPageSelect={handleSetPageSize}
                />
            )}
        </Card>
    );
};

export default SkTable;
