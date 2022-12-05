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

import { generateUUID } from '@core/utils/generateUUID';

import { SKTableProps } from './Sktable.interfaces';

const DEFAULT_PAGE_SIZE = 20;
const FIRST_PAGE_INDEX = 0;

const SkTable = function <T>({
    title,
    titleDescription,
    columns,
    rows,
    rowsCount = rows.length,
    components,
    onSort,
    ...props
}: SKTableProps<T>) {
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

                if (onSort) {
                    onSort({ prop: columns[index].prop, direction });
                }
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

    let rowsSorted = rows;

    if (!onSort) {
        rowsSorted = rows.sort((a, b) => {
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
    }

    const skRows = rowsSorted
        .map((row) => ({
            columns: columns.map((column) => ({
                ...column,
                data: row,
                value: row[column.prop as keyof T],
            })),
        }))
        .slice(currentPageIndex * pageSize, currentPageIndex * pageSize + pageSize);

    const { isPlain, shouldSort = true, ...restProps } = props;

    return (
        <Card isPlain={isPlain || false}>
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
                        <Tr key={generateUUID()}>
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
