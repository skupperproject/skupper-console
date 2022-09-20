import React, { useState } from 'react';

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
    List,
    ListItem,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Title,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import SitesController from '../services';
import { QueriesSites } from '../services/services.enum';
import { SitesRoutesPaths, SitesRoutesPathLabel, SiteDetails, Labels } from '../Sites.enum';

const Site = function () {
    const navigate = useNavigate();
    const { id: siteId } = useParams() as { id: string };
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: site, isLoading: isLoadingSite } = useQuery(
        [QueriesSites.GetSite, siteId],
        () => SitesController.getSite(siteId),
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

    if (isLoadingSite) {
        return <LoadingPage />;
    }

    if (!site) {
        return null;
    }

    const { processes, linkedSites, hosts, name, nameSpace } = site;

    return (
        <Stack hasGutter className="pf-u-pl-md">
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={SitesRoutesPaths.Sites}>{SitesRoutesPathLabel.Sites}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{name}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <StackItem>
                <Title headingLevel="h1">
                    <ResourceIcon type="site" />
                    {name}
                </Title>
            </StackItem>

            <StackItem>
                <Card isFullHeight isRounded>
                    <CardTitle>
                        <Title headingLevel="h2">{Labels.SiteInfo}</Title>
                    </CardTitle>
                    <CardBody>
                        <DescriptionList>
                            <DescriptionListGroup>
                                <DescriptionListTerm>{SiteDetails.Name}</DescriptionListTerm>
                                <DescriptionListDescription>{name}</DescriptionListDescription>
                            </DescriptionListGroup>

                            <DescriptionListGroup>
                                <DescriptionListTerm>{SiteDetails.Namespace}</DescriptionListTerm>
                                <DescriptionListDescription>{nameSpace}</DescriptionListDescription>
                            </DescriptionListGroup>
                        </DescriptionList>
                    </CardBody>
                </Card>
            </StackItem>
            <StackItem>
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50">
                        <Card isFullHeight isRounded>
                            <CardTitle>
                                <Title headingLevel="h2">{Labels.Links}</Title>
                            </CardTitle>
                            <CardBody>
                                {(!!linkedSites.length && (
                                    <List isPlain>
                                        {linkedSites.map(({ identity, name: linkedSiteName }) => (
                                            <ListItem key={identity}>{linkedSiteName}</ListItem>
                                        ))}
                                    </List>
                                )) || <EmptyData />}
                            </CardBody>
                        </Card>
                    </SplitItem>
                    <SplitItem className="pf-u-w-50">
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
                    </SplitItem>
                    <SplitItem className="pf-u-w-50">
                        <Card isFullHeight isRounded>
                            <CardTitle>
                                <Title headingLevel="h2">{Labels.Processes}</Title>
                            </CardTitle>
                            <CardBody>
                                {(!!processes.length && (
                                    <List isPlain>
                                        {processes.map(({ identity, name: processName }) => (
                                            <ListItem key={identity}>{processName}</ListItem>
                                        ))}
                                    </List>
                                )) || <EmptyData />}
                            </CardBody>
                        </Card>
                    </SplitItem>
                </Split>
            </StackItem>
        </Stack>
    );
};

export default Site;
