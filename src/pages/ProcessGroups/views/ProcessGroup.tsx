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
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';

import { ProcessGroupsLabels, ProcessGroupsRoutesPaths } from '../ProcessGroups.enum';
import { QueriesProcessGroups } from '../services/services.enum';

const ProcessGroup = function () {
    const navigate = useNavigate();
    const { id: processGroupId } = useParams() as { id: string };

    const { data: processGroup, isLoading: isLoadingProcessGroup } = useQuery(
        [QueriesProcessGroups.GetProcessGroup, processGroupId],
        () => RESTApi.fetchProcessGroup(processGroupId),
        {
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcess } = useQuery(
        [QueriesProcessGroups.GetProcessesByProcessGroup, processGroupId],
        () => RESTApi.fetchProcessesByProcessGroup(processGroupId),
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

    if (isLoadingProcessGroup || isLoadingProcess) {
        return <LoadingPage />;
    }

    if (!processGroup || !processes) {
        return null;
    }

    const { name } = processGroup;

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
                <ProcessesTable processes={processes} />
            </GridItem>
        </Grid>
    );
};

export default ProcessGroup;
