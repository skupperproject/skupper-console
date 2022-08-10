import React, { FC, useState } from 'react';

import { Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, ThProps, Tr } from '@patternfly/react-table';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';

import { FlowPairBasic, ProcessesTableProps } from '../services/services.interfaces';
import { ProcessesColumns } from '../VANServices.constants';
import {
    FlowPairsColumnsNames,
    ProcessesColumnsNames,
    VanServicesDescriptions,
} from '../VANServices.enum';

import './FlowPairs.css';

const ProcessesTable: FC<ProcessesTableProps> = function ({ processes }) {
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

    const processesSorted = processes.sort((a: any, b: any) => {
        const columnName = ProcessesColumns[activeSortIndex || 0].prop as keyof FlowPairBasic;

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
        <TableComposable variant="compact" borders={true} className="processes-table">
            <Thead>
                <Tr>
                    <Th sort={getSortParams(0)}>{ProcessesColumnsNames.Site}</Th>
                    <Th sort={getSortParams(1)}>{FlowPairsColumnsNames.Process}</Th>
                    <Th sort={getSortParams(2)} className="align-th-right">
                        {FlowPairsColumnsNames.ByteRate}
                    </Th>
                    <Th sort={getSortParams(3)} className="align-th-right">
                        {FlowPairsColumnsNames.Bytes}
                    </Th>
                    <Th sort={getSortParams(4)} className="align-th-right">
                        {FlowPairsColumnsNames.Latency}
                        <Tooltip position="right" content={VanServicesDescriptions.TTFBDesc}>
                            <OutlinedQuestionCircleIcon className="pf-u-ml-xs" />
                        </Tooltip>
                    </Th>
                    <Th sort={getSortParams(5)}>{FlowPairsColumnsNames.Host}</Th>
                    <Th sort={getSortParams(6)}>{FlowPairsColumnsNames.Port}</Th>
                    <Th sort={getSortParams(7)}>{FlowPairsColumnsNames.ImageName}</Th>
                    <Th sort={getSortParams(8)}>{FlowPairsColumnsNames.Protocol}</Th>
                </Tr>
            </Thead>
            <Tbody>
                {!!processes.length &&
                    processesSorted.map(
                        ({
                            id,
                            bytes,
                            byteRate,
                            host,
                            port,
                            siteName,
                            processName,
                            latency,
                            imageName,
                            protocol,
                        }) => (
                            <Tr key={id}>
                                <Td dataLabel={FlowPairsColumnsNames.Site}>{siteName}</Td>
                                <Td dataLabel={FlowPairsColumnsNames.Host}>{processName}</Td>
                                <Td
                                    dataLabel={FlowPairsColumnsNames.ByteRate}
                                    className="align-td-right"
                                >
                                    {formatBytes(byteRate, 3)}
                                </Td>
                                <Td
                                    dataLabel={FlowPairsColumnsNames.Bytes}
                                    className="align-td-right"
                                >
                                    {formatBytes(bytes, 3)}
                                </Td>
                                <Td
                                    dataLabel={FlowPairsColumnsNames.Process}
                                    className="align-td-right"
                                >
                                    {formatTime(latency)}
                                </Td>
                                <Td dataLabel={FlowPairsColumnsNames.Port}>{host}</Td>
                                <Td dataLabel={FlowPairsColumnsNames.Process}>{port}</Td>
                                <Td dataLabel={FlowPairsColumnsNames.ImageName}>{imageName}</Td>
                                <Td dataLabel={FlowPairsColumnsNames.Protocol}>{protocol}</Td>
                            </Tr>
                        ),
                    )}
            </Tbody>
        </TableComposable>
    );
};

export default ProcessesTable;
