import React, { FC } from 'react';

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

import {
    ProcessGroupsLabels,
    ProcessGroupsRoutesPaths,
    ProcessGroupsTableColumns,
} from '../ProcessGroups.enum';
import { ProcessGroupsTableProps } from '../ProcessGroups.interfaces';

const ProcessGroupsTable: FC<ProcessGroupsTableProps> = function ({ processGroups: services }) {
    return (
        <Card>
            <CardTitle>
                <Flex>
                    <TextContent>
                        <Text component={TextVariants.h1}>{ProcessGroupsLabels.Section}</Text>
                    </TextContent>
                    <Tooltip position="right" content={ProcessGroupsLabels.Description}>
                        <OutlinedQuestionCircleIcon />
                    </Tooltip>
                </Flex>
            </CardTitle>
            <TableComposable borders={false} variant="compact" isStickyHeader isStriped>
                <Thead>
                    <Tr>
                        <Th>{ProcessGroupsTableColumns.Name}</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {services.map(({ identity, name }) => (
                        <Tr key={identity}>
                            <Td>
                                <ResourceIcon type="service" />
                                <Link to={`${ProcessGroupsRoutesPaths.ProcessGroups}/${identity}`}>
                                    {name}
                                </Link>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </TableComposable>
        </Card>
    );
};

export default ProcessGroupsTable;
