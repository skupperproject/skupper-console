import React, { useState } from 'react';

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

export interface SKTable<T> {
    columns: {
        name: string;
        prop: keyof T;
        component?: string;
    }[];
    rows: T[];
    title?: string;
    titleDescription?: string;
    components?: Record<string, Function>;
}

const SkTable = function <T>({ title, titleDescription, columns, rows, components }: SKTable<T>) {
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

    const skRows = rowsSorted.map((row) => ({
        identity: row['identity' as keyof T],
        columns: columns.map((column, index) => ({
            ...column,
            data: row,
            value: row[column.prop as keyof T],
            identity: `${row['identity' as keyof T]}${index}`,
        })),
    }));

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
                        <Tr key={row.identity as string}>
                            {row.columns.map(({ data, value, component, identity }) => {
                                const Component = components && component && components[component];

                                return Component ? (
                                    <Td key={identity}>
                                        <Component data={data} value={value} />
                                    </Td>
                                ) : (
                                    <Td key={identity}>
                                        <div className="text-ellipsis">{value as string}</div>
                                    </Td>
                                );
                            })}
                        </Tr>
                    ))}
                </Tbody>
            </TableComposable>
        </Card>
    );
};

export default SkTable;
