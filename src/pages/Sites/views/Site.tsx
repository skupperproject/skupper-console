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
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import SitesController from '../services';
import { QueriesSites } from '../services/services.enum';
import { SitesRoutesPaths, SitesRoutesPathLabel, Labels } from '../Sites.enum';

const Site = function () {
    const navigate = useNavigate();
    const { id: siteId } = useParams() as { id: string };

    const { data: site, isLoading: isLoadingSite } = useQuery(
        [QueriesSites.GetSite, siteId],
        () => SitesController.getSite(siteId),
        {
            onError: handleError,
        },
    );

    const { data: sites, isLoading: isLoadingSites } = useQuery(
        [QueriesSites.GetSites],
        () => SitesController.getSites(),
        {
            onError: handleError,
        },
    );

    const { data: hosts, isLoading: isLoadingHosts } = useQuery(
        [QueriesSites.GetHostsBySiteId, siteId],
        () => SitesController.getHostsBySiteId(siteId),
        {
            onError: handleError,
        },
    );

    const { data: links, isLoading: isLoadingLinks } = useQuery(
        [QueriesSites.GetLinksBySiteId, siteId],
        () => SitesController.getLinksBySiteId(siteId),
        {
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesSites.GetProcessesBySiteId, siteId],
        () => SitesController.getActiveProcessesBySiteId(siteId),
        {
            onError: handleError,
        },
    );

    const { data: routers, isLoading: isLoadingRouters } = useQuery(
        [QueriesSites.GetRouters],
        () => SitesController.getRouters(),
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
        isLoadingSites ||
        !sites ||
        !routers ||
        !site ||
        !hosts ||
        !links ||
        !processes
    ) {
        return <LoadingPage />;
    }

    const { name, nameSpace } = site;
    const { connected } = SitesController.getLinkedSites(site, links, routers);
    const linkedSites = sites.filter(({ identity }) => connected.includes(identity));

    return (
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
                </Flex>
            </GridItem>

            <GridItem>
                <Card isFullHeight isRounded>
                    <CardTitle>
                        <Title headingLevel="h2">{Labels.Details}</Title>
                    </CardTitle>
                    <CardBody>
                        <DescriptionList>
                            <DescriptionListGroup>
                                <DescriptionListTerm>{Labels.Name}</DescriptionListTerm>
                                <DescriptionListDescription>{name}</DescriptionListDescription>
                            </DescriptionListGroup>

                            <DescriptionListGroup>
                                <DescriptionListTerm>{Labels.Namespace}</DescriptionListTerm>
                                <DescriptionListDescription>{nameSpace}</DescriptionListDescription>
                            </DescriptionListGroup>
                        </DescriptionList>
                    </CardBody>
                </Card>
            </GridItem>
            <GridItem span={4}>
                <Card isFullHeight isRounded>
                    <CardTitle>
                        <Title headingLevel="h2">{Labels.Links}</Title>
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
                        <Title headingLevel="h2">{Labels.Hosts}</Title>
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
                        <Title headingLevel="h2">{Labels.Processes}</Title>
                    </CardTitle>
                    <CardBody>
                        {(!!processes.length && (
                            <List isPlain>
                                {processes.map(({ identity, name: processName }) => (
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
    );
};

export default Site;
