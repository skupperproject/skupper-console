import React, { FC, useState } from 'react';

import { Divider, Panel, Text, TextContent, Title, TitleSizes } from '@patternfly/react-core';
import { Caption, TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { formatBytes } from '@core/utils/formatBytes';
import DeploymentsServices from '@pages/Deployments/services';
import { QueriesDeployments } from '@pages/Deployments/services/deployments.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { ConnectionsColumns, ConnectionsLabels } from '@pages/Sites/components/Connections.enum';
import { UPDATE_INTERVAL } from 'config';

interface TopologyDeploymentDetailsProps {
    id?: string;
}

const TopologyDeploymentDetails: FC<TopologyDeploymentDetailsProps> = function ({ id }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: deployment, isLoading } = useQuery(
        [QueriesDeployments.GetDeployments, id],
        () => DeploymentsServices.fetchDeployment(id),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    if (isLoading) {
        return null;
    }

    if (!deployment) {
        return null;
    }

    const httpRequestsReceivedEntries = Object.values(deployment.httpRequestsReceived);
    const httpRequestsSentEntries = Object.values(deployment.httpRequestsSent);
    const tcpConnectionsInEntries = Object.values(deployment.tcpConnectionsIn);
    const tcpConnectionsOutEntries = Object.values(deployment.tcpConnectionsOut);

    return (
        <Panel>
            <Title headingLevel="h2" size={TitleSizes['4xl']} className="pf-u-mb-md">
                {capitalizeFirstLetter(deployment.site.site_name)}/
                {capitalizeFirstLetter(deployment.service.address)}
            </Title>
            <Text component="h3" style={{ color: 'var(--pf-global--Color--200)' }}>
                {deployment.site.site_name} ● {deployment.service.address}
            </Text>
            <Divider className="pf-u-mt-xs" />
            <TextContent className="pf-u-mt-md">
                {(!!httpRequestsSentEntries.length || !!httpRequestsReceivedEntries.length) && (
                    <>
                        {!!httpRequestsSentEntries.length && (
                            <TableComposable
                                aria-label="flows table"
                                variant="compact"
                                isStickyHeader
                                borders={false}
                            >
                                <Caption>{ConnectionsLabels.HTTPrequestsOut}</Caption>

                                <Thead>
                                    <Tr>
                                        <Th>{ConnectionsColumns.Name}</Th>
                                        <Th>{ConnectionsColumns.BytesOut}</Th>
                                        <Th>{ConnectionsColumns.Requests}</Th>
                                    </Tr>
                                </Thead>
                                {httpRequestsSentEntries.map((info) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td dataLabel={ConnectionsColumns.Name}>
                                                {`${info.client}`}
                                            </Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.BytesIn}
                                            >{`${formatBytes(info.bytes_out)}`}</Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.Requests}
                                            >{`${info.requests}`}</Td>
                                        </Tr>
                                    </Tbody>
                                ))}
                            </TableComposable>
                        )}
                        {!!httpRequestsReceivedEntries.length && (
                            <TableComposable
                                aria-label="flows table"
                                variant="compact"
                                isStickyHeader
                                borders={false}
                            >
                                <Caption>{ConnectionsLabels.HTTPrequestsIn}</Caption>

                                <Thead>
                                    <Tr>
                                        <Th>{ConnectionsColumns.Name}</Th>
                                        <Th>{ConnectionsColumns.BytesOut}</Th>
                                        <Th>{ConnectionsColumns.Requests}</Th>
                                    </Tr>
                                </Thead>
                                {httpRequestsReceivedEntries.map((info) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={ConnectionsColumns.Name}
                                            >{`${info.client}`}</Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.BytesIn}
                                            >{`${formatBytes(info.bytes_out)}`}</Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.Requests}
                                            >{`${info.requests}`}</Td>
                                        </Tr>
                                    </Tbody>
                                ))}
                            </TableComposable>
                        )}
                    </>
                )}

                {(!!tcpConnectionsOutEntries.length || !!tcpConnectionsInEntries.length) && (
                    <>
                        {!!tcpConnectionsOutEntries.length && (
                            <TableComposable
                                aria-label="flows table"
                                variant="compact"
                                isStickyHeader
                                borders={false}
                            >
                                <Caption>{ConnectionsLabels.TCPconnectionsOut}</Caption>
                                <Thead>
                                    <Tr>
                                        <Th>{ConnectionsColumns.Name}</Th>
                                        <Th>{ConnectionsColumns.BytesOut}</Th>
                                    </Tr>
                                </Thead>
                                {tcpConnectionsOutEntries.map((info) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={ConnectionsColumns.Name}
                                            >{`${info.client}`}</Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.Bytes}
                                            >{`${formatBytes(info.bytes_out)}`}</Td>
                                        </Tr>
                                    </Tbody>
                                ))}
                            </TableComposable>
                        )}
                        {!!tcpConnectionsInEntries.length && (
                            <TableComposable
                                aria-label="flows table"
                                variant="compact"
                                isStickyHeader
                                borders={false}
                            >
                                <Caption>{ConnectionsLabels.TCPconnectionsIn}</Caption>
                                <Thead>
                                    <Tr>
                                        <Th>{ConnectionsColumns.Name}</Th>
                                        <Th>{ConnectionsColumns.BytesOut}</Th>
                                    </Tr>
                                </Thead>
                                {tcpConnectionsInEntries.map((info) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={ConnectionsColumns.Name}
                                            >{`${info.client}`}</Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.Bytes}
                                            >{`${formatBytes(info.bytes_out)}`}</Td>
                                        </Tr>
                                    </Tbody>
                                ))}
                            </TableComposable>
                        )}
                    </>
                )}
            </TextContent>
        </Panel>
    );
};

export default TopologyDeploymentDetails;
