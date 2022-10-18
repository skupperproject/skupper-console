import React, { FC, useState } from 'react';

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
import { Link } from 'react-router-dom';

import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { ProcessesColumns } from '../Addresses.constants';
import { FlowPairsColumnsNames, ProcessesColumnsNames } from '../Addresses.enum';
import { ProcessesTableProps } from '../Addresses.interfaces';
import { ProcessRow } from '../services/services.interfaces';

import './FlowPairs.css';

const AddressProcessesTable: FC<ProcessesTableProps> = function ({ processes }) {
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

    const processesSorted = processes.sort((a, b) => {
        const columnName = ProcessesColumns[activeSortIndex || 0].prop as keyof ProcessRow;

        const paramA = a[columnName];
        const paramB = b[columnName];

        if (paramA === paramB) {
            return 0;
        }

        if (activeSortDirection === 'asc') {
            return paramA > paramB ? 1 : -1;
        }

        return paramA > paramB ? -1 : 1;
    });

    return (
        <TableComposable borders={true} className="processes-table">
            <Thead>
                <Tr>
                    <Th sort={getSortParams(0)}>{FlowPairsColumnsNames.Process}</Th>
                    <Th sort={getSortParams(1)}>{ProcessesColumnsNames.Site}</Th>
                    <Th sort={getSortParams(2)} modifier="fitContent">
                        {FlowPairsColumnsNames.Host}
                    </Th>
                    <Th sort={getSortParams(3)} modifier="fitContent">
                        {FlowPairsColumnsNames.Port}
                    </Th>
                    <Th sort={getSortParams(4)}>{FlowPairsColumnsNames.ImageName}</Th>
                    <Th sort={getSortParams(5)} className="align-th-right">
                        {FlowPairsColumnsNames.ByteRate}
                    </Th>
                    <Th sort={getSortParams(6)} className="align-th-right">
                        {FlowPairsColumnsNames.Bytes}
                    </Th>
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
                            siteId,
                            siteName,
                            processName,
                            imageName,
                        }) => (
                            <Tr key={id}>
                                <Td>
                                    <Link to={`${ProcessesRoutesPaths.Processes}/${id}`}>
                                        <TableText wrapModifier="truncate">{processName}</TableText>
                                    </Link>
                                </Td>
                                <Td>
                                    <Link to={`${SitesRoutesPaths.Sites}/${siteId}`}>
                                        {siteName}
                                    </Link>
                                </Td>
                                <Td>{host}</Td>
                                <Td>{port}</Td>
                                <Td>{imageName}</Td>
                                <Td className="align-td-right">
                                    <b>{formatByteRate(byteRate, 3)}</b>
                                </Td>
                                <Td className="align-td-right">
                                    <b>{formatBytes(bytes, 3)}</b>
                                </Td>
                            </Tr>
                        ),
                    )}
            </Tbody>
        </TableComposable>
    );
};

export default AddressProcessesTable;
