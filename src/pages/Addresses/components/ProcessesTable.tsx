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

import ResourceIcon from '@core/components/ResourceIcon';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
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
                    <Th sort={getSortParams(1)}>{ProcessesColumnsNames.Process}</Th>
                    <Th sort={getSortParams(2)}>{ProcessesColumnsNames.Site}</Th>
                    <Th sort={getSortParams(3)} modifier="fitContent">
                        {FlowPairsColumnsNames.Host}
                    </Th>
                    <Th sort={getSortParams(4)} modifier="fitContent">
                        {FlowPairsColumnsNames.Port}
                    </Th>
                    <Th sort={getSortParams(5)}>{FlowPairsColumnsNames.ImageName}</Th>
                    <Th sort={getSortParams(6)} className="align-th-right">
                        {FlowPairsColumnsNames.ByteRate}
                    </Th>
                    <Th sort={getSortParams(7)} className="align-th-right">
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
                            groupId,
                            groupName,
                            imageName,
                        }) => (
                            <Tr key={id}>
                                <Td width={20}>
                                    <Link to={`${ProcessesRoutesPaths.Processes}/${id}`}>
                                        <TableText wrapModifier="truncate">
                                            <ResourceIcon type="process" />
                                            {processName}
                                        </TableText>
                                    </Link>
                                </Td>
                                <Td width={20}>
                                    <Link
                                        to={`${ProcessGroupsRoutesPaths.ProcessGroups}/${groupId}`}
                                    >
                                        <TableText wrapModifier="truncate">
                                            <ResourceIcon type="service" />
                                            {groupName}
                                        </TableText>
                                    </Link>
                                </Td>
                                <Td width={20}>
                                    <Link to={`${SitesRoutesPaths.Sites}/${siteId}`}>
                                        <TableText wrapModifier="truncate">
                                            <ResourceIcon type="site" />
                                            {siteName}
                                        </TableText>
                                    </Link>
                                </Td>
                                <Td>{host}</Td>
                                <Td>{port}</Td>
                                <Td>
                                    <TableText wrapModifier="truncate">{imageName}</TableText>
                                </Td>
                                <Td className="align-td-right">
                                    <b>
                                        <TableText wrapModifier="truncate">
                                            {formatByteRate(byteRate, 1)}
                                        </TableText>
                                    </b>
                                </Td>
                                <Td className="align-td-right">
                                    <b>
                                        <TableText wrapModifier="truncate">
                                            {formatBytes(bytes, 1)}
                                        </TableText>
                                    </b>
                                </Td>
                            </Tr>
                        ),
                    )}
            </Tbody>
        </TableComposable>
    );
};

export default AddressProcessesTable;
