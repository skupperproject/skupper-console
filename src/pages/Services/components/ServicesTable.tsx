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

import { Labels, ServicesRoutesPaths, ServicesTableColumns } from '../Services.enum';
import { ServicesTableProps } from '../Services.interfaces';

const ServicesTable: FC<ServicesTableProps> = function ({ services }) {
    return (
        <Card>
            <CardTitle>
                <Flex>
                    <TextContent>
                        <Text component={TextVariants.h1}>{Labels.Services}</Text>
                    </TextContent>
                    <Tooltip position="right" content={Labels.ServicesDescription}>
                        <OutlinedQuestionCircleIcon />
                    </Tooltip>
                </Flex>
            </CardTitle>
            <TableComposable borders={false} variant="compact" isStickyHeader isStriped>
                <Thead>
                    <Tr>
                        <Th>{ServicesTableColumns.Name}</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {services.map(({ identity, name }) => (
                        <Tr key={identity}>
                            <Td>
                                <ResourceIcon type="service" />
                                <Link to={`${ServicesRoutesPaths.Services}/${identity}`}>
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

export default ServicesTable;
