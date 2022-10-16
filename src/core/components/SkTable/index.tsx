import React, { useState } from 'react';

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

import { SKTable } from './Sktable.interfaces';

const DEFAULT_PAGE_SIZE = 20;
const FIRST_PAGE_INDEX = 0;

const SkTable = function <T extends { identity: string }>({
    title,
    titleDescription,
    columns,
    rows,
    rowsCount = rows.length,
    components,
}: SKTable<T>) {
    const [activeSortIndex, setActiveSortIndex] = useState<number>();
    const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>();
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(FIRST_PAGE_INDEX);
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

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

    function handleSetPage(
        _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
        perPage: number,
    ) {
        setCurrentPageIndex(perPage);
    }

    function handlePerPageSelect(
        _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
        perPageSelect: number,
    ) {
        setPageSize(perPageSelect);
        setCurrentPageIndex(FIRST_PAGE_INDEX);
    }

    const rowsSorted = rows.sort((a, b) => {
        const columnName = columns[activeSortIndex || 0].prop;

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

    const skRows = rowsSorted
        .map((row) => ({
            identity: row.identity,
            columns: columns.map((column, index) => ({
                ...column,
                data: row,
                value: row[column.prop as keyof T],
                identity: `${row.identity}${index}`,
            })),
        }))
        .slice(currentPageIndex * pageSize, currentPageIndex * pageSize + pageSize);

    return (
        <Card>
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
            <TableComposable borders={false} variant="compact" isStickyHeader isStriped>
                <Thead>
                    <Tr>
                        {columns.map((column, index) => (
                            <Th key={column.name} sort={getSortParams(index)}>
                                {column.name}
                            </Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {skRows.map((row) => (
                        <Tr key={row.identity}>
                            {row.columns.map(({ data, value, component, identity }) => {
                                const Component = components && component && components[component];

                                return Component ? (
                                    <Td key={identity}>
                                        <Component data={data} value={value} />
                                    </Td>
                                ) : (
                                    <Td key={identity}>
                                        <TableText wrapModifier="truncate">
                                            {value as string}
                                        </TableText>
                                    </Td>
                                );
                            })}
                        </Tr>
                    ))}
                </Tbody>
            </TableComposable>
            {rows.length > pageSize && (
                <Pagination
                    className="pf-u-my-xs"
                    perPageComponent="button"
                    itemCount={rowsCount}
                    perPage={pageSize}
                    page={currentPageIndex + 1}
                    onSetPage={handleSetPage}
                    onPerPageSelect={handlePerPageSelect}
                />
            )}
        </Card>
    );
};

export default SkTable;
