import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardTitle,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Tab,
    Tabs,
    TabTitleText,
    Text,
    TextContent,
    TextVariants,
} from '@patternfly/react-core';
import { LongArrowAltDownIcon, LongArrowAltUpIcon, SearchIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { SitesRoutesPaths } from '@pages/Sites/sites.enum';
import { UPDATE_INTERVAL } from 'config';

import { DeploymentsRoutesPaths, DeploymentsRoutesPathLabel } from '../Deployments.enum';
import DeploymentsServices from '../services';
import { QueriesDeployments } from '../services/deployments.enum';
import { DeploymentDetailsColumns, DeploymentDetailsLabels } from './Details.enum';
import DeploymentsMetrics from './Metrics';
import { DeploymentsLabels, DeploymentsOverviewColumns } from './Overview.enum';

const DeploymentsDetails = function () {
    const navigate = useNavigate();
    const { id: deploymentId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [activeTabKey, setaActiveTabKey] = useState<number>();

    const { data: deployment, isLoading } = useQuery(
        [QueriesDeployments.GetDeployments, deploymentId],
        () => DeploymentsServices.fetchDeployment(deploymentId),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    function handleTabClick(
        _: React.MouseEvent<HTMLElement, MouseEvent>,
        tabIndex: number | string,
    ) {
        setaActiveTabKey(tabIndex as number);
    }

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

    const ConnectionsTables = function () {
        return (
            <Stack hasGutter>
                {!!(httpConnectionsIn.length || httpConnectionsOut.length) && (
                    <StackItem>
                        <Split hasGutter>
                            <SplitItem className="pf-u-w-50vw">
                                <Card>
                                    <CardTitle>{DeploymentDetailsLabels.HTTPrequestsIn}</CardTitle>
                                    {httpConnectionsIn.length === 0 ? (
                                        <EmptyData />
                                    ) : (
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
                                                ({
                                                    id,
                                                    client,
                                                    bytes_in,
                                                    bytes_out,
                                                    requests,
                                                    latency_max,
                                                }) => (
                                                    <Tbody key={`${id}${client}`}>
                                                        <Tr>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.ServiceName
                                                                }
                                                            >
                                                                {client}
                                                            </Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.Requests
                                                                }
                                                            >
                                                                {requests}
                                                            </Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.MaxLatency
                                                                }
                                                            >
                                                                {`${formatTime(latency_max, {
                                                                    startSize: 'ms',
                                                                })}`}
                                                            </Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.BytesIn
                                                                }
                                                            >
                                                                {`${formatBytes(bytes_in)}`}
                                                            </Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.BytesOut
                                                                }
                                                            >
                                                                {`${formatBytes(bytes_out)}`}
                                                            </Td>
                                                        </Tr>
                                                    </Tbody>
                                                ),
                                            )}
                                        </TableComposable>
                                    )}
                                </Card>
                            </SplitItem>

                            <SplitItem className="pf-u-w-50vw">
                                <Card>
                                    <CardTitle>{DeploymentDetailsLabels.HTTPrequestsOut}</CardTitle>
                                    {httpConnectionsOut.length === 0 ? (
                                        <EmptyData />
                                    ) : (
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
                                                ({
                                                    id,
                                                    client,
                                                    bytes_in,
                                                    bytes_out,
                                                    requests,
                                                    latency_max,
                                                }) => (
                                                    <Tbody key={`${id}${client}`}>
                                                        <Tr>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.ServiceName
                                                                }
                                                            >
                                                                {client}
                                                            </Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.Requests
                                                                }
                                                            >
                                                                {requests}
                                                            </Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.MaxLatency
                                                                }
                                                            >
                                                                {`${formatTime(latency_max, {
                                                                    startSize: 'ms',
                                                                })}`}
                                                            </Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.BytesIn
                                                                }
                                                            >
                                                                {`${formatBytes(bytes_in)}`}
                                                            </Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.BytesOut
                                                                }
                                                            >
                                                                {`${formatBytes(bytes_out)}`}
                                                            </Td>
                                                        </Tr>
                                                    </Tbody>
                                                ),
                                            )}
                                        </TableComposable>
                                    )}
                                </Card>
                            </SplitItem>
                        </Split>
                    </StackItem>
                )}

                {!!(tcpConnectionsIn.length || tcpConnectionsOut.length) && (
                    <StackItem>
                        <Split hasGutter>
                            <SplitItem className="pf-u-w-50vw">
                                <Card>
                                    <CardTitle>
                                        {DeploymentDetailsLabels.TCPconnectionsIn}
                                    </CardTitle>
                                    {tcpConnectionsIn.length === 0 ? (
                                        <EmptyData />
                                    ) : (
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
                                            {tcpConnectionsIn.map(
                                                ({ id, client, bytes_in, bytes_out }) => (
                                                    <Tbody key={`${id}${client}`}>
                                                        <Tr>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.ServiceName
                                                                }
                                                            >
                                                                {client}
                                                            </Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.Ip
                                                                }
                                                            >{`${id.split('@')[0]}`}</Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.BytesIn
                                                                }
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
                                    )}
                                </Card>
                            </SplitItem>

                            <SplitItem className="pf-u-w-50vw">
                                <Card>
                                    <CardTitle>
                                        {DeploymentDetailsLabels.TCPconnectionsOut}
                                    </CardTitle>
                                    {tcpConnectionsOut.length === 0 ? (
                                        <EmptyData />
                                    ) : (
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
                                                    <Tbody key={`${id}${client}`}>
                                                        <Tr>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.ServiceName
                                                                }
                                                            >
                                                                {client}
                                                            </Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.Ip
                                                                }
                                                            >{`${id.split('@')[0]}`}</Td>
                                                            <Td
                                                                dataLabel={
                                                                    DeploymentDetailsColumns.BytesIn
                                                                }
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
                                    )}
                                </Card>
                            </SplitItem>
                        </Split>
                    </StackItem>
                )}
            </Stack>
        );
    };

    const deploymentName = `${site.site_name}/${service.address}`;

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
                <Text component={TextVariants.h1} className="pf-u-mb-xl pf-u-font-weight-bold">
                    <ResourceIcon type="deployment" />
                    {deploymentName}
                </Text>
            </TextContent>

            <TextContent>
                <Text component={TextVariants.h2}>{DeploymentsLabels.Details}</Text>
            </TextContent>

            <div className="pf-u-mb-lg">
                <div className="  pf-u-font-weight-bold">{DeploymentsOverviewColumns.Site}</div>
                <span>
                    <Link to={`${SitesRoutesPaths.Details}/${site.site_id}`}>
                        <SearchIcon /> {site.site_name}
                    </Link>
                </span>
            </div>

            <div className="pf-u-mb-lg">
                <div className="  pf-u-font-weight-bold">{DeploymentsOverviewColumns.Service}</div>
                <span>
                    <ResourceIcon type="service" />
                    {service.address}
                </span>
            </div>

            <div className="pf-u-mb-lg">
                <div className="  pf-u-font-weight-bold">{DeploymentsOverviewColumns.Protocol}</div>
                <span>{service.protocol}</span>
            </div>

            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
                <Tab
                    eventKey={0}
                    title={<TabTitleText>{DeploymentDetailsLabels.TabTraffic}</TabTitleText>}
                >
                    <ConnectionsTables />
                </Tab>
                <Tab
                    eventKey={1}
                    title={<TabTitleText>{DeploymentDetailsLabels.TabMetrics}</TabTitleText>}
                >
                    <DeploymentsMetrics
                        deploymentName={deploymentName}
                        httpRequestsReceived={httpConnectionsIn}
                        httpRequestsSent={httpConnectionsOut}
                        tcpConnectionsIn={tcpConnectionsIn}
                        tcpConnectionsOut={tcpConnectionsOut}
                    />
                </Tab>
            </Tabs>
        </Stack>
    );
};

export default DeploymentsDetails;
