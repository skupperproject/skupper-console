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
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { ProcessGroupResponse, ProcessResponse } from 'API/REST.interfaces';

import ProcessTable from '../components/ProcessesTable';
import { ProcessGroupsLabels, ProcessGroupsRoutesPaths } from '../ProcessGroups.enum';
import ProcessGroupsController from '../services';
import { QueriesProcessGroups } from '../services/services.enum';

const ProcessGroup = function () {
    const navigate = useNavigate();
    const { id: processGroupId } = useParams() as { id: string };
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: processGroup, isLoading: isLoadingProcessGroup } = useQuery(
        [QueriesProcessGroups.GetProcessGroup, processGroupId],
        () => ProcessGroupsController.GetProcessGroup(processGroupId),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcess } = useQuery(
        [QueriesProcessGroups.GetProcessesByProcessGroup, processGroupId],
        () => ProcessGroupsController.getProcessesByProcessGroup(processGroupId),
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

    if (isLoadingProcessGroup || isLoadingProcess) {
        return <LoadingPage />;
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
                <ProcessTable processes={processes as ProcessResponse[]} />
            </GridItem>
        </Grid>
    );
};

export default ProcessGroup;
