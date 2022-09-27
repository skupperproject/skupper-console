import React, { FC, useState } from 'react';

import {
    Card,
    CardTitle,
    Flex,
    Text,
    TextContent,
    TextVariants,
    Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, ThProps, Tr } from '@patternfly/react-table';

export interface SKTable {
    columns: {
        name: string;
        prop: string;
        component: string;
    }[];
    rows: Record<string, any>[];
    title?: string;
    titleDescription?: string;
    components?: Record<string, any>;
}

const SkTable: FC<SKTable> = function ({ title, titleDescription, columns, rows, components }) {
    const [activeSortIndex, setActiveSortIndex] = useState<number>();
    const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>();

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

    const rowsSorted = rows.sort((a: any, b: any) => {
        const columnName = columns[activeSortIndex || 0].prop as keyof Record<string, any>;

        const paramA = a[columnName] as string | number;
        const paramB = b[columnName] as string | number;

        if (paramA === b[columnName]) {
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

    const data = rowsSorted.flatMap((row: Record<string, any>) =>
        columns.map((column) => ({
            ...column,
            row,
            value: row[column.prop],
        })),
    );

    return (
        <Card>
            {title && (
                <CardTitle>
                    <Flex>
                        <TextContent>
                            <Text component={TextVariants.h1}>{title}</Text>
                        </TextContent>
                        <Tooltip position="right" content={titleDescription}>
                            <OutlinedQuestionCircleIcon />
                        </Tooltip>
                    </Flex>
                </CardTitle>
            )}
            <TableComposable borders={false} variant="compact" isStickyHeader isStriped>
                <Thead>
                    {columns.map((column, index) => (
                        <Tr key={column.name}>
                            <Th sort={getSortParams(index)}>{column.name}</Th>
                        </Tr>
                    ))}
                </Thead>
                <Tbody>
                    {data.map(({ row, value, component }) => {
                        const Component = components && components[component];

                        return (
                            <Tr key={row.identity}>
                                {Component ? (
                                    <Td>
                                        <Component data={row} value={value} />
                                    </Td>
                                ) : (
                                    <Td>{value}</Td>
                                )}
                            </Tr>
                        );
                    })}
                </Tbody>
            </TableComposable>
        </Card>
    );
};

export default SkTable;
