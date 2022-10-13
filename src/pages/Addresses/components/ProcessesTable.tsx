import React, { FC, useState } from 'react';

import { Tooltip } from '@patternfly/react-core';
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
import { Link } from 'react-router-dom';

import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { ProcessesColumns } from '../Addresses.constants';
import {
    FlowPairsColumnsNames,
    ProcessesColumnsNames,
    AddressesDescriptions,
} from '../Addresses.enum';
import { ProcessesTableProps, ProcessRow } from '../services/services.interfaces';

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
                    <Th sort={getSortParams(7)} className="align-th-right">
                        {FlowPairsColumnsNames.MaxTTFB}
                        <Tooltip position="right" content={AddressesDescriptions.TTFBDesc}>
                            <OutlinedQuestionCircleIcon className="pf-u-ml-xs" />
                        </Tooltip>
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
                            maxTTFB,
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
                                <Td className="align-td-right">
                                    <b> {formatTime(maxTTFB)}</b>
                                </Td>
                            </Tr>
                        ),
                    )}
            </Tbody>
        </TableComposable>
    );
};

export default ProcessesTable;
