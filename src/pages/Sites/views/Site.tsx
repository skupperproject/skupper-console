import React from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Card,
    CardBody,
    CardTitle,
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Flex,
    Grid,
    GridItem,
    List,
    ListItem,
    Title,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import ResourceIcon from '@core/components/ResourceIcon';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import {
    TopologyRoutesPaths,
    TopologyURLFilters,
    TopologyViews,
} from '@pages/Topology/Topology.enum';
import { RESTApi } from 'API/REST';

import SitesController from '../services';
import { QueriesSites } from '../services/services.enum';
import { SitesRoutesPaths, SitesRoutesPathLabel, SiteLabels } from '../Sites.enum';

const processQueryParams = { filter: 'processRole.external' };

const Site = function () {
    const navigate = useNavigate();
    const { id: siteId } = useParams() as { id: string };

    const { data: site, isLoading: isLoadingSite } = useQuery(
        [QueriesSites.GetSite, siteId],
        () => RESTApi.fetchSite(siteId),
        {
            onError: handleError,
        },
    );

    const { data: sites, isLoading: isLoadingSites } = useQuery(
        [QueriesSites.GetSites],
        () => RESTApi.fetchSites(),
        {
            onError: handleError,
        },
    );

    const { data: hosts, isLoading: isLoadingHosts } = useQuery(
        [QueriesSites.GetHostsBySiteId, siteId],
        () => RESTApi.fetchHostsBySite(siteId),
        {
            onError: handleError,
        },
    );

    const { data: links, isLoading: isLoadingLinks } = useQuery(
        [QueriesSites.GetLinksBySiteId, siteId],
        () => RESTApi.fetchLinksBySite(siteId),
        {
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesSites.GetProcessesBySiteId, siteId],
        () => RESTApi.fetchProcessesBySite(siteId, processQueryParams),
        {
            onError: handleError,
        },
    );

    const { data: routers, isLoading: isLoadingRouters } = useQuery(
        [QueriesSites.GetRouters],
        () => RESTApi.fetchRouters(),
        {
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        navigate(route);
    }

    if (
        isLoadingSite ||
        isLoadingHosts ||
        isLoadingLinks ||
        isLoadingProcesses ||
        isLoadingRouters ||
        isLoadingSites
    ) {
        return <LoadingPage />;
    }

    if (!sites || !routers || !site || !hosts || !links || !processes) {
        return null;
    }

    const { name, nameSpace } = site;
    const { connected } = SitesController.getLinkedSites(site, links, routers);
    const linkedSites = sites.filter(({ identity }) => connected.includes(identity));
    const liveProcesses = processes.filter(({ endTime }) => !endTime);

    return (
        <TransitionPage>
            <Grid hasGutter>
                <GridItem>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={SitesRoutesPaths.Sites}>{SitesRoutesPathLabel.Sites}</Link>
                        </BreadcrumbItem>
                        <BreadcrumbHeading to="#">{name}</BreadcrumbHeading>
                    </Breadcrumb>
                </GridItem>

                <GridItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                        <ResourceIcon type="site" />
                        <Title headingLevel="h1">{name}</Title>

                        <Link
                            to={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Sites}&${TopologyURLFilters.IdSelected}=${siteId}`}
                        >
                            {`(${SiteLabels.GoToTopology})`}
                        </Link>
                    </Flex>
                </GridItem>

                <GridItem>
                    <Card isFullHeight isRounded>
                        <CardTitle>
                            <Title headingLevel="h2">{SiteLabels.Details}</Title>
                        </CardTitle>
                        <CardBody>
                            <DescriptionList>
                                <DescriptionListGroup>
                                    <DescriptionListTerm>{SiteLabels.Name}</DescriptionListTerm>
                                    <DescriptionListDescription>{name}</DescriptionListDescription>
                                </DescriptionListGroup>

                                <DescriptionListGroup>
                                    <DescriptionListTerm>
                                        {SiteLabels.Namespace}
                                    </DescriptionListTerm>
                                    <DescriptionListDescription>
                                        {nameSpace}
                                    </DescriptionListDescription>
                                </DescriptionListGroup>
                            </DescriptionList>
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem span={4}>
                    <Card isFullHeight isRounded>
                        <CardTitle>
                            <Title headingLevel="h2">{SiteLabels.Links}</Title>
                        </CardTitle>
                        <CardBody>
                            {(!!linkedSites.length && (
                                <List isPlain>
                                    {linkedSites.map(({ identity, name: linkedSiteName }) => (
                                        <ListItem key={identity}>
                                            <Flex>
                                                <ResourceIcon type="site" />
                                                <Link to={`${SitesRoutesPaths.Sites}/${identity}`}>
                                                    {linkedSiteName}
                                                </Link>
                                            </Flex>
                                        </ListItem>
                                    ))}
                                </List>
                            )) || <EmptyData />}
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem span={4}>
                    <Card isFullHeight isRounded>
                        <CardTitle>
                            <Title headingLevel="h2">{SiteLabels.Hosts}</Title>
                        </CardTitle>
                        <CardBody>
                            {(!!hosts.length && (
                                <List isPlain>
                                    {hosts.map(({ identity, provider, name: hostName }) => (
                                        <ListItem
                                            key={identity}
                                        >{`${provider} (${hostName})`}</ListItem>
                                    ))}
                                </List>
                            )) || <EmptyData />}
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem span={4}>
                    <Card isFullHeight isRounded>
                        <CardTitle>
                            <Title headingLevel="h2">{SiteLabels.Processes}</Title>
                        </CardTitle>
                        <CardBody>
                            {(!!liveProcesses.length && (
                                <List isPlain>
                                    {liveProcesses.map(({ identity, name: processName }) => (
                                        <ListItem key={identity}>
                                            <Flex>
                                                <ResourceIcon type="process" />
                                                <Link
                                                    to={`${ProcessesRoutesPaths.Processes}/${identity}`}
                                                >
                                                    {processName}
                                                </Link>
                                            </Flex>
                                        </ListItem>
                                    ))}
                                </List>
                            )) || <EmptyData />}
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>
        </TransitionPage>
    );
};

export default Site;
