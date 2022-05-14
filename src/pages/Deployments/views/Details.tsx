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
    Text,
    TextContent,
    TextVariants,
} from '@patternfly/react-core';
import { LongArrowAltDownIcon, LongArrowAltUpIcon, SearchIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { SiteRoutesPaths } from '@pages/Sites/sites.enum';
import { UPDATE_INTERVAL } from 'config';

import { DeploymentsRoutesPaths, DeploymentsRoutesPathLabel } from '../Deployments.enum';
import DeploymentsServices from '../services';
import { QueriesDeployments } from '../services/deployments.enum';
import { DeploymentDetailsColumns, DeploymentDetailsColumnsLabels } from './Details.enum';
import { DeploymentsLabels, DeploymentsOverviewColumns } from './Overview.enum';

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

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

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

    const { service, site } = deployment;

    return (
        <Stack hasGutter className="pf-u-pl-md">
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

            <TextContent>
                <Text component={TextVariants.h1} className=" pf-u-font-weight-bold">
                    <span className="sk-resource-icon sk-resource-deployment">D</span>
                    {`${site.site_name}/${service.address}`}
                </Text>
            </TextContent>

            <TextContent>
                <Text component={TextVariants.h2}>{DeploymentsLabels.Details}</Text>
            </TextContent>

            <Split>
                <SplitItem className="pf-u-w-50">
                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">
                            {DeploymentsOverviewColumns.Site}
                        </div>
                        <span>
                            <Link to={`${SiteRoutesPaths.Details}/${site.site_id}`}>
                                <SearchIcon /> {site.site_name}
                            </Link>
                        </span>
                    </div>
                </SplitItem>

                <SplitItem className="pf-u-w-50">
                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">
                            {DeploymentsOverviewColumns.Service}
                        </div>
                        <span>
                            <span className="sk-resource-icon sk-resource-service">S</span>
                            {service.address}
                        </span>
                    </div>

                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">
                            {DeploymentsOverviewColumns.Protocol}
                        </div>
                        <span>{service.protocol}</span>
                    </div>
                </SplitItem>
            </Split>

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
