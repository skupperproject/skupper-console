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
import { formatByteRate } from '@core/utils/formatBytes';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { FlowPairsColumns } from '../Addresses.constants';
import { FlowPairsColumnsNames } from '../Addresses.enum';
import { FlowPairBasic, FlowPairsTableProps } from '../services/services.interfaces';

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
            <Thead>
                <Tr>
                    <Th sort={getSortParams(0)}>{FlowPairsColumnsNames.Client}</Th>
                    <Th sort={getSortParams(1)}>{FlowPairsColumnsNames.Site}</Th>

                    <Th sort={getSortParams(2)}>{FlowPairsColumnsNames.Port}</Th>
                    <Th sort={getSortParams(3)}>{FlowPairsColumnsNames.ByteRateTX}</Th>
                    <Th sort={getSortParams(4)}>{FlowPairsColumnsNames.ByteRateRX}</Th>
                    <Th sort={getSortParams(5)}>{FlowPairsColumnsNames.Server}</Th>
                    <Th sort={getSortParams(6)}>{FlowPairsColumnsNames.Site}</Th>
                </Tr>
            </Thead>
            <Tbody>
                {!!flowPairs.length &&
                    connectionsSorted.map(
                        ({
                            id,
                            byteRate,
                            port,
                            siteId,
                            siteName,
                            processId,
                            processName,
                            targetSiteId,
                            targetSiteName,
                            targetByteRate,
                            targetProcessId,
                            targetProcessName,
                        }) => (
                            <Tr key={id}>
                                <Td width={25}>
                                    <Link to={`${ProcessesRoutesPaths.Processes}/${processId}`}>
                                        <TableText wrapModifier="truncate">
                                            <ResourceIcon type="process" />
                                            {processName}
                                        </TableText>
                                    </Link>
                                </Td>
                                <Td>
                                    <Link to={`${SitesRoutesPaths.Sites}/${siteId}`}>
                                        <TableText wrapModifier="truncate">
                                            <ResourceIcon type="site" />
                                            {siteName}
                                        </TableText>
                                    </Link>
                                </Td>
                                <Td>{port}</Td>
                                <Td>
                                    <b>{formatByteRate(byteRate, 1)}</b>
                                </Td>
                                <Td>
                                    <b>{formatByteRate(targetByteRate, 1)}</b>
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
                                <Td>
                                    <Link to={`${SitesRoutesPaths.Sites}/${targetSiteId}`}>
                                        <TableText wrapModifier="truncate">
                                            <ResourceIcon type="site" />
                                            {targetSiteName}
                                        </TableText>
                                    </Link>
                                </Td>
                            </Tr>
                        ),
                    )}
            </Tbody>
        </TableComposable>
    );
};

export default FlowsPairsTable;
