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
    Title,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import ProcessesTable from '@pages/Processes/components/ProcessesTable';
import ProcessesController from '@pages/Processes/services';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import SitesController from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { ProcessGroupResponse } from 'API/REST.interfaces';

import { ProcessGroupsLabels, ProcessGroupsRoutesPaths } from '../ProcessGroups.enum';
import ProcessGroupsController from '../services';
import { QueriesProcessGroups } from '../services/services.enum';

const ProcessGroup = function () {
    const navigate = useNavigate();
    const { id: processGroupId } = useParams() as { id: string };

    const { data: processGroup, isLoading: isLoadingProcessGroup } = useQuery(
        [QueriesProcessGroups.GetProcessGroup, processGroupId],
        () => ProcessGroupsController.GetProcessGroup(processGroupId),
        {
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcess } = useQuery(
        [QueriesProcessGroups.GetProcessesByProcessGroup, processGroupId],
        () => ProcessGroupsController.getProcessesByProcessGroup(processGroupId),
        {
            onError: handleError,
        },
    );

    const { data: sites, isLoading: isLoadingSites } = useQuery(
        [QueriesSites.GetSites],
        SitesController.getSites,
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

    if (isLoadingProcessGroup || isLoadingProcess || isLoadingSites) {
        return <LoadingPage />;
    }

    if (!processGroup || !sites || !processes) {
        return null;
    }

    const { name } = processGroup as ProcessGroupResponse;

    return (
        <Grid hasGutter>
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link to={ProcessGroupsRoutesPaths.ProcessGroups}>
                        {ProcessGroupsLabels.Section}
                    </Link>
                </BreadcrumbItem>
                <BreadcrumbHeading to="#">{name}</BreadcrumbHeading>
            </Breadcrumb>

            <Flex alignItems={{ default: 'alignItemsCenter' }}>
                <ResourceIcon type="service" />
                <Title headingLevel="h1">{name}</Title>
            </Flex>

            <GridItem span={12}>
                <Card isFullHeight isRounded>
                    <CardTitle>
                        <Title headingLevel="h2">{ProcessGroupsLabels.Details}</Title>
                    </CardTitle>
                    <CardBody>
                        <DescriptionList>
                            <DescriptionListGroup>
                                <DescriptionListTerm>
                                    {ProcessGroupsLabels.Name}
                                </DescriptionListTerm>
                                <DescriptionListDescription>{name}</DescriptionListDescription>
                            </DescriptionListGroup>
                        </DescriptionList>
                    </CardBody>
                </Card>
            </GridItem>
            <GridItem span={12}>
                <ProcessesTable
                    processes={ProcessesController.getProcessesExtended(sites, processes)}
                />
            </GridItem>
        </Grid>
    );
};

export default ProcessGroup;
