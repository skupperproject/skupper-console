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
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { FlowPairsColumns } from '../Addresses.constants';
import { FlowPairsColumnsNames } from '../Addresses.enum';
import { FlowPairBasic, FlowPairsTableProps } from '../services/services.interfaces';

import './FlowPairs.css';

const FlowsPairsTable: FC<FlowPairsTableProps> = function ({ flowPairs }) {
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

    const connectionsSorted = flowPairs.sort((a, b) => {
        const columnName = FlowPairsColumns[activeSortIndex || 0].prop as keyof FlowPairBasic;

        const paramA = a[columnName] || 0;
        const paramB = b[columnName] || 0;

        if (paramA === paramB) {
            return 0;
        }

        if (activeSortDirection === 'asc') {
            return paramA > paramB ? 1 : -1;
        }

        return paramA > paramB ? -1 : 1;
    });

    return (
        <TableComposable variant="compact">
            <Thead hasNestedHeader>
                <Tr>
                    <Th hasRightBorder colSpan={6}>
                        {FlowPairsColumnsNames.FlowForward}
                    </Th>
                    <Th colSpan={6} hasRightBorder>
                        {FlowPairsColumnsNames.FlowReverse}
                    </Th>
                </Tr>
                <Tr>
                    <Th isSubheader sort={getSortParams(0)}>
                        {FlowPairsColumnsNames.Process}
                    </Th>
                    <Th isSubheader sort={getSortParams(1)}>
                        {FlowPairsColumnsNames.Site}
                    </Th>

                    <Th isSubheader sort={getSortParams(2)}>
                        {FlowPairsColumnsNames.Host}
                    </Th>
                    <Th isSubheader sort={getSortParams(3)}>
                        {FlowPairsColumnsNames.Port}
                    </Th>
                    <Th isSubheader className="align-th-right" sort={getSortParams(4)}>
                        {FlowPairsColumnsNames.ByteRate}
                    </Th>
                    <Th
                        isSubheader
                        className="align-th-right"
                        sort={getSortParams(5)}
                        hasRightBorder
                    >
                        {FlowPairsColumnsNames.Bytes}
                    </Th>
                    <Th isSubheader sort={getSortParams(6)}>
                        {FlowPairsColumnsNames.Process}
                    </Th>
                    <Th isSubheader sort={getSortParams(7)}>
                        {FlowPairsColumnsNames.Site}
                    </Th>
                    <Th isSubheader sort={getSortParams(8)}>
                        {FlowPairsColumnsNames.Host}
                    </Th>
                    <Th isSubheader sort={getSortParams(9)}>
                        {FlowPairsColumnsNames.Port}
                    </Th>
                    <Th isSubheader className="align-th-right" sort={getSortParams(10)}>
                        {FlowPairsColumnsNames.ByteRate}
                    </Th>
                    <Th
                        isSubheader
                        className="align-th-right"
                        sort={getSortParams(11)}
                        hasRightBorder
                    >
                        {FlowPairsColumnsNames.Bytes}
                    </Th>
                </Tr>
            </Thead>
            <Tbody>
                {!!flowPairs.length &&
                    connectionsSorted.map(
                        ({
                            id,
                            bytes,
                            byteRate,
                            host,
                            port,
                            siteId,
                            siteName,
                            processId,
                            processName,
                            targetSiteId,
                            targetSiteName,
                            targetByteRate,
                            targetBytes,
                            targetHost,
                            targetProcessId,
                            targetProcessName,
                            targetPort,
                        }) => (
                            <Tr key={id}>
                                <Td width={25} className="secondary-color">
                                    <Link to={`${ProcessesRoutesPaths.Processes}/${processId}`}>
                                        <TableText wrapModifier="truncate">
                                            <ResourceIcon type="process" />
                                            {processName}
                                        </TableText>
                                    </Link>
                                </Td>
                                <Td width={25} className="secondary-color">
                                    <Link to={`${SitesRoutesPaths.Sites}/${siteId}`}>
                                        <TableText wrapModifier="truncate">
                                            <ResourceIcon type="site" />
                                            {siteName}
                                        </TableText>
                                    </Link>
                                </Td>
                                <Td className="secondary-color">{host}</Td>
                                <Td className="secondary-color">{`${port}`}</Td>
                                <Td className="align-td-right secondary-color">
                                    <b>{formatByteRate(byteRate, 1)}</b>
                                </Td>
                                <Td className="align-td-right secondary-color td-border-right ">
                                    <b>{formatBytes(bytes, 1)}</b>
                                </Td>
                                <Td width={25}>
                                    <Link
                                        to={`${ProcessesRoutesPaths.Processes}/${targetProcessId}`}
                                    >
                                        <TableText wrapModifier="truncate">
                                            <ResourceIcon type="process" />
                                            {targetProcessName}
                                        </TableText>
                                    </Link>
                                </Td>
                                <Td width={25}>
                                    <Link to={`${SitesRoutesPaths.Sites}/${targetSiteId}`}>
                                        <TableText wrapModifier="truncate">
                                            <ResourceIcon type="site" />
                                            {targetSiteName}
                                        </TableText>
                                    </Link>
                                </Td>
                                <Td>{targetHost}</Td>
                                <Td>{`${targetPort}`}</Td>
                                <Td className="align-td-right">
                                    <b>{formatByteRate(targetByteRate, 1)}</b>
                                </Td>
                                <Td className="align-td-right">
                                    <b>{formatBytes(targetBytes, 1)}</b>
                                </Td>
                            </Tr>
                        ),
                    )}
            </Tbody>
        </TableComposable>
    );
};

export default FlowsPairsTable;
