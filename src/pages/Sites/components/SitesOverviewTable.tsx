import React, { memo } from 'react';

import { Card } from '@patternfly/react-core';
import { CloudIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

import { SitesRoutesPaths } from '../sites.enum';
import { SitesOverviewColumns } from './SitesOverviewTable.enum';
import { SitesOverviewTableProps } from './SitesOverviewTable.interfaces';

const SitesOverviewTable = memo(function ({ sites }: SitesOverviewTableProps) {
    return (
        <Card>
            <TableComposable
                className="network-table"
                aria-label="network table"
                borders={false}
                variant="compact"
                isStriped
            >
                <Thead>
                    <Tr>
                        <Th>{SitesOverviewColumns.Name}</Th>
                        <Th>{SitesOverviewColumns.Namespace}</Th>
                        <Th>{SitesOverviewColumns.Version}</Th>
                        <Th>{SitesOverviewColumns.Gateway}</Th>
                        <Th>{SitesOverviewColumns.NumSitesLinked}</Th>
                    </Tr>
                </Thead>
                {sites?.map((row) => (
                    <Tbody key={row.siteId}>
                        <Tr>
                            <Td dataLabel={SitesOverviewColumns.Name}>
                                <ResourceIcon type="site" />
                                <Link to={`${SitesRoutesPaths.Details}/${row.siteId}`}>
                                    {row.siteName}
                                </Link>
                            </Td>
                            <Td dataLabel={SitesOverviewColumns.Namespace}>{`${row.namespace}`}</Td>
                            <Td dataLabel={SitesOverviewColumns.Version}>{`${row.version}`}</Td>
                            <Td dataLabel={SitesOverviewColumns.Gateway}>
                                {row.gateway ? (
                                    <CloudIcon color="var(--pf-global--success-color--100)" />
                                ) : (
                                    <CloudIcon color="var(--pf-global--disabled-color--300)" />
                                )}
                            </Td>
                            <Td
                                dataLabel={SitesOverviewColumns.Version}
                            >{`${row.connected.length}`}</Td>
                        </Tr>
                    </Tbody>
                ))}
            </TableComposable>
        </Card>
    );
});

export default SitesOverviewTable;
