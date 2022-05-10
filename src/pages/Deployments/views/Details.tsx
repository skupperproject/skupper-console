import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardHeader,
} from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { DeploymentsRoutesPaths, DeploymentsRoutesPathLabel } from '../Deployments.enum';
import DeploymentsServices from '../services';
import { QueriesDeployments } from '../services/deployments.enum';
import { DeploymentDetailsColumns, DeploymentDetailsColumnsLabels } from './Details.enum';

const DeploymentsDetails = function () {
    const navigate = useNavigate();
    const { id: deploymentId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: deployment, isLoading } = useQuery(
        [QueriesDeployments.GetDeployments, deploymentId],
        () => DeploymentsServices.fetchDeployment(deploymentId),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: number }) {
        const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!deployment) {
        return null;
    }

    const { tcpConnectionsIn, tcpConnectionsOut, httpConnectionsOut, httpConnectionsIn } =
        deployment;

    return (
        <>
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link to={DeploymentsRoutesPaths.Deployments}>
                        {DeploymentsRoutesPathLabel.Deployments}
                    </Link>
                </BreadcrumbItem>
                <BreadcrumbHeading to="#">{deploymentId?.split('_')[0]}</BreadcrumbHeading>
            </Breadcrumb>

            {httpConnectionsIn.length !== 0 && (
                <Card>
                    <CardHeader>{DeploymentDetailsColumnsLabels.HTTPrequestsIn}</CardHeader>
                    <TableComposable
                        className="network-table"
                        aria-label="network table"
                        borders={false}
                        variant="compact"
                    >
                        <Thead>
                            <Tr>
                                <Th>{DeploymentDetailsColumns.ServiceName}</Th>
                                <Th>{DeploymentDetailsColumns.Requests}</Th>
                                <Th>{DeploymentDetailsColumns.BytesIn}</Th>
                                <Th>{DeploymentDetailsColumns.BytesOut}</Th>
                                <Th>{DeploymentDetailsColumns.MaxLatency}</Th>
                            </Tr>
                        </Thead>
                        {httpConnectionsIn.map(
                            ({ id, client, bytes_in, bytes_out, requests, latency_max }) => (
                                <Tbody key={id}>
                                    <Tr>
                                        <Td dataLabel={DeploymentDetailsColumns.ServiceName}>
                                            {client}
                                        </Td>
                                        <Td dataLabel={DeploymentDetailsColumns.Requests}>
                                            {requests}
                                        </Td>
                                        <Td dataLabel={DeploymentDetailsColumns.BytesIn}>
                                            {`${formatBytes(bytes_in)}`}
                                        </Td>
                                        <Td dataLabel={DeploymentDetailsColumns.BytesOut}>
                                            {`${formatBytes(bytes_out)}`}
                                        </Td>
                                        <Td dataLabel={DeploymentDetailsColumns.MaxLatency}>
                                            {`${formatBytes(latency_max)}`}
                                        </Td>
                                    </Tr>
                                </Tbody>
                            ),
                        )}
                    </TableComposable>
                </Card>
            )}

            {httpConnectionsOut.length !== 0 && (
                <Card>
                    <CardHeader>{DeploymentDetailsColumnsLabels.HTTPrequestsOut}</CardHeader>
                    <TableComposable
                        className="network-table"
                        aria-label="network table"
                        borders={false}
                        variant="compact"
                    >
                        <Thead>
                            <Tr>
                                <Th>{DeploymentDetailsColumns.ServiceName}</Th>
                                <Th>{DeploymentDetailsColumns.Requests}</Th>
                                <Th>{DeploymentDetailsColumns.BytesIn}</Th>
                                <Th>{DeploymentDetailsColumns.BytesOut}</Th>
                                <Th>{DeploymentDetailsColumns.MaxLatency}</Th>
                            </Tr>
                        </Thead>
                        {httpConnectionsOut.map(
                            ({ id, client, bytes_in, bytes_out, requests, latency_max }) => (
                                <Tbody key={id}>
                                    <Tr>
                                        <Td dataLabel={DeploymentDetailsColumns.ServiceName}>
                                            {client}
                                        </Td>
                                        <Td dataLabel={DeploymentDetailsColumns.Requests}>
                                            {requests}
                                        </Td>
                                        <Td dataLabel={DeploymentDetailsColumns.BytesIn}>
                                            {`${formatBytes(bytes_in)}`}
                                        </Td>
                                        <Td dataLabel={DeploymentDetailsColumns.BytesOut}>
                                            {`${formatBytes(bytes_out)}`}
                                        </Td>
                                        <Td dataLabel={DeploymentDetailsColumns.MaxLatency}>
                                            {`${formatBytes(latency_max)}`}
                                        </Td>
                                    </Tr>
                                </Tbody>
                            ),
                        )}
                    </TableComposable>
                </Card>
            )}
            {tcpConnectionsIn.length !== 0 && (
                <Card>
                    <CardHeader>{DeploymentDetailsColumnsLabels.TCPconnectionsIn}</CardHeader>
                    <TableComposable
                        className="network-table"
                        aria-label="network table"
                        borders={false}
                        variant="compact"
                    >
                        <Thead>
                            <Tr>
                                <Th>{DeploymentDetailsColumns.ServiceName}</Th>
                                <Th>{DeploymentDetailsColumns.Ip}</Th>
                                <Th>{DeploymentDetailsColumns.BytesIn}</Th>
                                <Th>{DeploymentDetailsColumns.BytesOut}</Th>
                            </Tr>
                        </Thead>
                        {tcpConnectionsIn.map(({ id, client, bytes_in, bytes_out }) => (
                            <Tbody key={id}>
                                <Tr>
                                    <Td dataLabel={DeploymentDetailsColumns.ServiceName}>
                                        {client}
                                    </Td>
                                    <Td dataLabel={DeploymentDetailsColumns.Ip}>{`${
                                        id.split('@')[0]
                                    }`}</Td>
                                    <Td
                                        dataLabel={DeploymentDetailsColumns.BytesIn}
                                    >{`${formatBytes(bytes_in)}`}</Td>
                                    <Td
                                        dataLabel={DeploymentDetailsColumns.BytesOut}
                                    >{`${formatBytes(bytes_out)}`}</Td>
                                </Tr>
                            </Tbody>
                        ))}
                    </TableComposable>
                </Card>
            )}
            {tcpConnectionsOut.length !== 0 && (
                <Card>
                    <CardHeader>{DeploymentDetailsColumnsLabels.TCPconnectionsOut}</CardHeader>
                    <TableComposable
                        className="network-table"
                        aria-label="network table"
                        borders={false}
                        variant="compact"
                    >
                        <Thead>
                            <Tr>
                                <Th>{DeploymentDetailsColumns.ServiceName}</Th>
                                <Th>{DeploymentDetailsColumns.Ip}</Th>
                                <Th>{DeploymentDetailsColumns.BytesIn}</Th>
                                <Th>{DeploymentDetailsColumns.BytesOut}</Th>
                            </Tr>
                        </Thead>
                        {tcpConnectionsOut.map(({ id, client, bytes_in, bytes_out }) => (
                            <Tbody key={id}>
                                <Tr>
                                    <Td dataLabel={DeploymentDetailsColumns.ServiceName}>
                                        {client}
                                    </Td>
                                    <Td dataLabel={DeploymentDetailsColumns.Ip}>{`${
                                        id.split('@')[0]
                                    }`}</Td>
                                    <Td
                                        dataLabel={DeploymentDetailsColumns.BytesIn}
                                    >{`${formatBytes(bytes_in)}`}</Td>
                                    <Td
                                        dataLabel={DeploymentDetailsColumns.BytesOut}
                                    >{`${formatBytes(bytes_out)}`}</Td>
                                </Tr>
                            </Tbody>
                        ))}
                    </TableComposable>
                </Card>
            )}
        </>
    );
};

export default DeploymentsDetails;
