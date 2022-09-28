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
    Flex,
    Grid,
    GridItem,
    Title,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import ProcessGroupsController from '@pages/ProcessGroups/services';
import { QueriesProcessGroups } from '@pages/ProcessGroups/services/services.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import SitesController from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { ProcessesLabels, ProcessesRoutesPaths } from '../Processes.enum';
import ProcessesController from '../services';
import { QueriesProcesses } from '../services/services.enum';

const Process = function () {
    const navigate = useNavigate();
    const { id: processId } = useParams() as { id: string };
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: process, isLoading: isLoadingProcess } = useQuery(
        [QueriesProcesses.GetProcess, processId],
        () => ProcessesController.getProcess(processId),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: site, isLoading: isLoadingSite } = useQuery(
        [QueriesSites.GetSite, process?.parent],
        () => SitesController.getSite(process?.parent || ''),
        {
            enabled: !!process?.parent,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processGroup, isLoading: isLoadingProcessGroup } = useQuery(
        [QueriesProcessGroups.GetProcessGroup, process?.groupIdentity],
        () => ProcessGroupsController.GetProcessGroup(process?.groupIdentity || ''),
        {
            enabled: !!process?.groupIdentity,
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

    if (isLoadingProcess && isLoadingSite && isLoadingProcessGroup) {
        return <LoadingPage />;
    }

    if (!process || !site || !processGroup) {
        return null;
    }

    const { name, imageName, sourceHost, hostName } = process;

    return (
        <Grid hasGutter>
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link to={ProcessesRoutesPaths.Processes}>{ProcessesLabels.Section}</Link>
                </BreadcrumbItem>
                <BreadcrumbHeading to="#">{name}</BreadcrumbHeading>
            </Breadcrumb>

            <Flex alignItems={{ default: 'alignItemsCenter' }}>
                <ResourceIcon type="process" />
                <Title headingLevel="h1">{name}</Title>
            </Flex>

            <GridItem span={12}>
                <Card isFullHeight isRounded>
                    <CardTitle>
                        <Title headingLevel="h2">{ProcessesLabels.Details}</Title>
                    </CardTitle>
                    <CardBody>
                        <DescriptionList>
                            <Grid hasGutter>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.Site}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            <ResourceIcon type="site" />
                                            <Link to={`${SitesRoutesPaths.Sites}/${site.identity}`}>
                                                {site.name}
                                            </Link>
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.ProcessGroup}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            <ResourceIcon type="service" />
                                            <Link
                                                to={`${ProcessGroupsRoutesPaths.ProcessGroups}/${processGroup.identity}`}
                                            >
                                                {processGroup.name}
                                            </Link>
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.Name}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            {name}
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.Image}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            {imageName}
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.SourceIP}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            {sourceHost}
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                                <GridItem span={6}>
                                    <DescriptionListGroup>
                                        <DescriptionListTerm>
                                            {ProcessesLabels.Host}
                                        </DescriptionListTerm>
                                        <DescriptionListDescription>
                                            {hostName}
                                        </DescriptionListDescription>
                                    </DescriptionListGroup>
                                </GridItem>
                            </Grid>
                        </DescriptionList>
                    </CardBody>
                </Card>
            </GridItem>
        </Grid>
    );
};

export default Process;
