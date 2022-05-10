import React, { useEffect, useState } from 'react';

import {
    Card,
    CardBody,
    EmptyState,
    EmptyStateBody,
    EmptyStateVariant,
    Label,
    Title,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { TableComposable, Th, Tr, Thead, Tbody, Td } from '@patternfly/react-table';

import { generateUUID } from '@core/utils/generateUUID';

import EmptyStateSpinner from '../EmptyStateSpinner';
import { SummaryCardColors, SummaryCardEmptyStatus } from './SummaryCard.enum';
import { SummaryCardProps, SummaryCardColumn, SummaryCardRow } from './SummaryCard.interfaces';

import './SummaryCard.scss';

const OverviewCard = function <T>({
    columns: cols,
    data,
    label,
    color,
    emptyMessage,
    styleCell,
    isLoading,
    noBorder = false,
    isPlain = false,
}: SummaryCardProps<T>) {
    const [rows, setRows] = useState<SummaryCardRow<T>[]>();
    const [columns, setColumns] = useState<string[]>();

    useEffect(() => {
        const dataNormalized = buildRows(data, cols);
        setColumns(cols.map(({ name }) => name));
        setRows(dataNormalized);
    }, [cols, data]);

    if (isLoading) {
        return (
            <Card isCompact isPlain isFullHeight>
                <CardBody
                    className={`sk-overview-table sk-table-border-${
                        color || SummaryCardColors.Gray
                    }`}
                >
                    <EmptyStateSpinner />
                </CardBody>
            </Card>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <Card isCompact isFullHeight isPlain={isPlain}>
            <CardBody
                className={
                    !noBorder
                        ? `sk-overview-table sk-table-border-${color || SummaryCardColors.Gray}`
                        : ''
                }
            >
                {label && (
                    <Label
                        className={`pf-m-${
                            color || SummaryCardColors.Gray
                        } sk-overview-table-label pf-u-box-shadow-md-bottom`}
                    >
                        {label}
                    </Label>
                )}
                {columns && rows && (
                    <TableComposable
                        aria-label="Simple table"
                        variant="compact"
                        borders={false}
                        isStriped
                    >
                        <Thead>
                            <Tr>
                                {columns.map((columnName) => (
                                    <Th className="pf-u-color-200" key={columnName}>
                                        {columnName}
                                    </Th>
                                ))}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows?.map(({ id, cells }) => (
                                <Tr key={id}>
                                    {cells.map(({ id: cellId, value, data: cell }, cellIndex) => (
                                        <Td
                                            key={cellId}
                                            dataLabel={columns[cellIndex]}
                                            className={styleCell && styleCell(cell, value)}
                                        >
                                            {value}
                                        </Td>
                                    ))}
                                </Tr>
                            ))}
                        </Tbody>
                    </TableComposable>
                )}
                {rows?.length === 0 && (
                    <EmptyState variant={EmptyStateVariant.xs} className="sk-overview-table-empty">
                        <Title headingLevel="h4" size="md">
                            <SearchIcon className="pf-u-mr-sm" />
                            {emptyMessage?.title || SummaryCardEmptyStatus.Title}
                        </Title>
                        <EmptyStateBody>
                            {emptyMessage?.description || SummaryCardEmptyStatus.Description}
                        </EmptyStateBody>
                    </EmptyState>
                )}
            </CardBody>
        </Card>
    );
};

export default OverviewCard;

function buildRows<T>(data: T[] = [], columns: SummaryCardColumn[]): SummaryCardRow<T>[] {
    return data.map((cells) => {
        const cellsPerRow = columns.map(({ property }) => ({
            id: generateUUID(),
            value: cells[property as keyof T] || null,
            data: cells,
        }));

        return { id: generateUUID(), cells: cellsPerRow };
    }, []);
}
