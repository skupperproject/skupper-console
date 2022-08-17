import React, { memo } from 'react';

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
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';

import { Labels, SitesRoutesPaths } from '../Sites.enum';
import { SitesListColumns } from './SitesList.enum';
import { SitesListProps } from './SitesList.interfaces';

const SitesTable = memo(function ({ sites }: SitesListProps) {
    return (
        <Card>
            <CardTitle>
                <Flex>
                    <TextContent>
                        <Text component={TextVariants.h1}>{Labels.Sites}</Text>
                    </TextContent>
                    <Tooltip position="right" content={Labels.SitesDescription}>
                        <OutlinedQuestionCircleIcon />
                    </Tooltip>
                </Flex>
            </CardTitle>
            <TableComposable
                className="network-table"
                aria-label="network table"
                borders={false}
                variant="compact"
                isStriped
            >
                <Thead>
                    <Tr>
                        <Th>{SitesListColumns.Name}</Th>
                        <Th>{SitesListColumns.Namespace}</Th>
                        <Th>{SitesListColumns.Version}</Th>
                        <Th>{SitesListColumns.NumSitesLinked}</Th>
                    </Tr>
                </Thead>
                {sites
                    ?.sort((a, b) => a.siteId.localeCompare(b.siteId))
                    .map((row) => (
                        <Tbody key={row.siteId}>
                            <Tr>
                                <Td dataLabel={SitesListColumns.Name}>
                                    <ResourceIcon type="site" />
                                    <Link to={`${SitesRoutesPaths.Details}/${row.siteId}`}>
                                        {row.siteName}
                                    </Link>
                                </Td>
                                <Td dataLabel={SitesListColumns.Namespace}>{`${row.namespace}`}</Td>
                                <Td dataLabel={SitesListColumns.Version}>{`${row.version}`}</Td>
                                <Td
                                    dataLabel={SitesListColumns.Version}
                                >{`${row.connected.length}`}</Td>
                            </Tr>
                        </Tbody>
                    ))}
            </TableComposable>
        </Card>
    );
});

export default SitesTable;
