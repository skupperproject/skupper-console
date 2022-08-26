import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardBody,
    CardTitle,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Title,
} from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import DescriptionItem from '../components/DescriptionItem';
import Metrics from '../components/Metrics';
import RealTimeMetrics from '../components/RealTimeMetrics';
import { SitesListColumns } from '../components/SitesList.enum';
import SitesServices from '../services';
import { QueriesSites } from '../services/services.enum';
import { SitesRoutesPaths, SitesRoutesPathLabel, ProcessesTableColumns } from '../Sites.enum';

const Site = function () {
    const navigate = useNavigate();
    const { id: siteId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: site, isLoading: isLoadingSite } = useQuery(
        [QueriesSites.GetSite, siteId],
        () => (siteId ? SitesServices.fetchSite(siteId) : null),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: traffic, isLoading: isLoadingTraffic } = useQuery(
        [QueriesSites.GetSiteTraffic, siteId],
        () => (siteId ? SitesServices.fetchTraffic(siteId) : null),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesSites.GetProcessesBySiteId, siteId],
        () => (siteId ? SitesServices.fetchProcessesBySiteId(siteId) : null),
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

    if (isLoadingSite || isLoadingTraffic || isLoadingProcesses) {
        return <LoadingPage />;
    }

    if (!site || !traffic) {
        return null;
    }

    const { httpRequestsReceived, httpRequestsSent, tcpConnectionsIn, tcpConnectionsOut } = traffic;

    return (
        <Stack hasGutter className="pf-u-pl-md">
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={SitesRoutesPaths.Sites}>{SitesRoutesPathLabel.Sites}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{site.siteName}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <StackItem>
                <Title headingLevel="h1">
                    <ResourceIcon type="site" />
                    {site.siteName}
                </Title>
            </StackItem>

            <StackItem>
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50">
                        <Card isFullHeight>
                            <CardTitle>
                                <Title headingLevel="h2">Details</Title>
                            </CardTitle>
                            <CardBody>
                                <DescriptionItem
                                    title={SitesListColumns.Name}
                                    value={site.siteName}
                                />
                                <DescriptionItem
                                    title={SitesListColumns.Namespace}
                                    value={site.namespace}
                                />
                                <DescriptionItem
                                    title={SitesListColumns.Gateway}
                                    value={site.gateway ? 'Yes' : 'No'}
                                />
                                <DescriptionItem
                                    title={SitesListColumns.RouterHostname}
                                    value={site.url}
                                />
                            </CardBody>
                        </Card>
                    </SplitItem>

                    <SplitItem className="pf-u-w-50">
                        <Card isFullHeight style={{ height: '500px', overflow: 'auto' }}>
                            <CardTitle>
                                <Title headingLevel="h2">Processes</Title>
                            </CardTitle>
                            <CardBody>
                                <TableComposable variant="compact" borders={false}>
                                    <Thead>
                                        <Tr>
                                            <Th>{ProcessesTableColumns.Name}</Th>
                                            <Th>{ProcessesTableColumns.SourceHost}</Th>
                                        </Tr>
                                    </Thead>
                                    {processes?.map(({ identity, name, sourceHost }) => (
                                        <Tbody key={`${identity}${name}`}>
                                            <Tr>
                                                <Td>{name}</Td>
                                                <Td>{sourceHost}</Td>
                                            </Tr>
                                        </Tbody>
                                    ))}
                                </TableComposable>
                            </CardBody>
                        </Card>
                    </SplitItem>
                </Split>
            </StackItem>

            <StackItem>
                <Metrics
                    name={site.siteName}
                    httpRequestsReceived={httpRequestsReceived}
                    httpRequestsSent={httpRequestsSent}
                    tcpConnectionsIn={tcpConnectionsIn}
                    tcpConnectionsOut={tcpConnectionsOut}
                />

                <RealTimeMetrics
                    name={site.siteName}
                    httpRequestsReceived={httpRequestsReceived}
                    httpRequestsSent={httpRequestsSent}
                    tcpConnectionsIn={tcpConnectionsIn}
                    tcpConnectionsOut={tcpConnectionsOut}
                />
            </StackItem>
        </Stack>
    );
};

export default Site;
