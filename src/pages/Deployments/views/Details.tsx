import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardHeader,
    Split,
    SplitItem,
    Stack,
    StackItem,
} from '@patternfly/react-core';
import { LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
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
        <Stack hasGutter>
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={DeploymentsRoutesPaths.Deployments}>
                            {DeploymentsRoutesPathLabel.Deployments}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{deploymentId?.split('_')[0]}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>
            {httpConnectionsIn.length !== 0 && (
                <StackItem>
                    <Card>
                        <CardHeader>{DeploymentDetailsColumnsLabels.HTTPrequestsIn}</CardHeader>
                        <TableComposable
                            className="network-table"
                            aria-label="network table"
                            borders={false}
                            variant="compact"
                            isStriped
                        >
                            <Thead>
                                <Tr>
                                    <Th>{DeploymentDetailsColumns.ServiceName}</Th>
                                    <Th>{DeploymentDetailsColumns.Requests}</Th>
                                    <Th>{DeploymentDetailsColumns.MaxLatency}</Th>
                                    <Th>
                                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                                        {DeploymentDetailsColumns.BytesIn}
                                    </Th>
                                    <Th>
                                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                                        {DeploymentDetailsColumns.BytesOut}
                                    </Th>
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
                                            <Td dataLabel={DeploymentDetailsColumns.MaxLatency}>
                                                {`${formatTime(latency_max, { startSize: 'ms' })}`}
                                            </Td>
                                            <Td dataLabel={DeploymentDetailsColumns.BytesIn}>
                                                {`${formatBytes(bytes_in)}`}
                                            </Td>
                                            <Td dataLabel={DeploymentDetailsColumns.BytesOut}>
                                                {`${formatBytes(bytes_out)}`}
                                            </Td>
                                        </Tr>
                                    </Tbody>
                                ),
                            )}
                        </TableComposable>
                    </Card>
                </StackItem>
            )}

            {httpConnectionsOut.length !== 0 && (
                <StackItem>
                    <Card>
                        <CardHeader>{DeploymentDetailsColumnsLabels.HTTPrequestsOut}</CardHeader>
                        <TableComposable
                            className="network-table"
                            aria-label="network table"
                            borders={false}
                            variant="compact"
                            isStriped
                        >
                            <Thead>
                                <Tr>
                                    <Th>{DeploymentDetailsColumns.ServiceName}</Th>
                                    <Th>{DeploymentDetailsColumns.Requests}</Th>
                                    <Th>{DeploymentDetailsColumns.MaxLatency}</Th>
                                    <Th>
                                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                                        {DeploymentDetailsColumns.BytesIn}
                                    </Th>
                                    <Th>
                                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                                        {DeploymentDetailsColumns.BytesOut}
                                    </Th>
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
                                            <Td dataLabel={DeploymentDetailsColumns.MaxLatency}>
                                                {`${formatTime(latency_max, { startSize: 'ms' })}`}
                                            </Td>
                                            <Td dataLabel={DeploymentDetailsColumns.BytesIn}>
                                                {`${formatBytes(bytes_in)}`}
                                            </Td>
                                            <Td dataLabel={DeploymentDetailsColumns.BytesOut}>
                                                {`${formatBytes(bytes_out)}`}
                                            </Td>
                                        </Tr>
                                    </Tbody>
                                ),
                            )}
                        </TableComposable>
                    </Card>
                </StackItem>
            )}
            <StackItem>
                <Split hasGutter>
                    {tcpConnectionsIn.length !== 0 && (
                        <SplitItem isFilled>
                            <Card>
                                <CardHeader>
                                    {DeploymentDetailsColumnsLabels.TCPconnectionsIn}
                                </CardHeader>
                                <TableComposable
                                    className="network-table"
                                    aria-label="network table"
                                    borders={false}
                                    variant="compact"
                                    isStriped
                                >
                                    <Thead>
                                        <Tr>
                                            <Th>{DeploymentDetailsColumns.ServiceName}</Th>
                                            <Th>{DeploymentDetailsColumns.Ip}</Th>
                                            <Th>
                                                <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                                                {DeploymentDetailsColumns.BytesIn}
                                            </Th>
                                            <Th>
                                                <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                                                {DeploymentDetailsColumns.BytesOut}
                                            </Th>
                                        </Tr>
                                    </Thead>
                                    {tcpConnectionsIn.map(({ id, client, bytes_in, bytes_out }) => (
                                        <Tbody key={id}>
                                            <Tr>
                                                <Td
                                                    dataLabel={DeploymentDetailsColumns.ServiceName}
                                                >
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
                        </SplitItem>
                    )}
                    {tcpConnectionsOut.length !== 0 && (
                        <SplitItem isFilled>
                            <Card>
                                <CardHeader>
                                    {DeploymentDetailsColumnsLabels.TCPconnectionsOut}
                                </CardHeader>
                                <TableComposable
                                    className="network-table"
                                    aria-label="network table"
                                    borders={false}
                                    variant="compact"
                                    isStriped
                                >
                                    <Thead>
                                        <Tr>
                                            <Th>{DeploymentDetailsColumns.ServiceName}</Th>
                                            <Th>{DeploymentDetailsColumns.Ip}</Th>
                                            <Th>
                                                <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                                                {DeploymentDetailsColumns.BytesIn}
                                            </Th>
                                            <Th>
                                                <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                                                {DeploymentDetailsColumns.BytesOut}
                                            </Th>
                                        </Tr>
                                    </Thead>
                                    {tcpConnectionsOut.map(
                                        ({ id, client, bytes_in, bytes_out }) => (
                                            <Tbody key={id}>
                                                <Tr>
                                                    <Td
                                                        dataLabel={
                                                            DeploymentDetailsColumns.ServiceName
                                                        }
                                                    >
                                                        {client}
                                                    </Td>
                                                    <Td dataLabel={DeploymentDetailsColumns.Ip}>{`${
                                                        id.split('@')[0]
                                                    }`}</Td>
                                                    <Td
                                                        dataLabel={DeploymentDetailsColumns.BytesIn}
                                                    >{`${formatBytes(bytes_in)}`}</Td>
                                                    <Td
                                                        dataLabel={
                                                            DeploymentDetailsColumns.BytesOut
                                                        }
                                                    >{`${formatBytes(bytes_out)}`}</Td>
                                                </Tr>
                                            </Tbody>
                                        ),
                                    )}
                                </TableComposable>
                            </Card>
                        </SplitItem>
                    )}
                </Split>
            </StackItem>
        </Stack>
    );
};

export default DeploymentsDetails;
