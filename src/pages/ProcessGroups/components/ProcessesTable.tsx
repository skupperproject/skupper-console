import React, { FC } from 'react';

import { Card, CardBody, CardTitle, Title } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import ResourceIcon from '@core/components/ResourceIcon';

import { ProcessGroupsLabels, ProcessesTableColumns } from '../ProcessGroups.enum';
import { ProcessesTableProps } from '../ProcessGroups.interfaces';

const ProcessTable: FC<ProcessesTableProps> = function ({ processes }) {
    return (
        <Card isFullHeight isRounded>
            <CardTitle>
                <Title headingLevel="h2">{ProcessGroupsLabels.Processes}</Title>
            </CardTitle>
            <CardBody>
                <TableComposable borders={false} variant="compact" isStriped className="sk-table">
                    <Thead>
                        <Tr>
                            <Th> {ProcessesTableColumns.Name}</Th>
                            <Th> {ProcessesTableColumns.SourceIP}</Th>
                            <Th> {ProcessesTableColumns.Host}</Th>
                            <Th> {ProcessesTableColumns.Image}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {processes.map(
                            ({ identity, name: processName, imageName, sourceHost, hostName }) => (
                                <Tr key={identity}>
                                    <Td>
                                        <ResourceIcon type="process" /> {processName}
                                    </Td>
                                    <Td>{sourceHost}</Td>
                                    <Td>{hostName}</Td>
                                    <Td>{imageName}</Td>
                                </Tr>
                            ),
                        )}
                    </Tbody>
                </TableComposable>
            </CardBody>
        </Card>
    );
};

export default ProcessTable;
