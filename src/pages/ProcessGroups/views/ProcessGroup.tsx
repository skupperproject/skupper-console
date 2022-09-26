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
    Stack,
    StackItem,
    Title,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import ProcessTable from '../components/ProcessesTable';
import { ProcessGroupsLabels, ProcessGroupsRoutesPaths } from '../ProcessGroups.enum';
import SitesController from '../services';
import { QueriesProcessGroups } from '../services/services.enum';

const ProcessGroup = function () {
    const navigate = useNavigate();
    const { id: processGroupId } = useParams() as { id: string };
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: processGroup, isLoading: isLoadingSite } = useQuery(
        [QueriesProcessGroups.GetProcessGroup, processGroupId],
        () => SitesController.GetProcessGroup(processGroupId),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcess } = useQuery(
        [QueriesProcessGroups.GetProcessesByProcessGroup, processGroupId],
        () => SitesController.getProcessesByProcessGroup(processGroupId),
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

    if (isLoadingSite || isLoadingProcess) {
        return <LoadingPage />;
    }

    if (!processGroup || !processes) {
        return null;
    }

    const { name } = processGroup;

    return (
        <Stack hasGutter className="pf-u-pl-md">
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={ProcessGroupsRoutesPaths.ProcessGroups}>
                            {ProcessGroupsLabels.Section}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{name}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <StackItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <ResourceIcon type="service" />
                    <Title headingLevel="h1">{name}</Title>
                </Flex>
            </StackItem>

            <StackItem>
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
            </StackItem>
            <StackItem>
                <ProcessTable processes={processes} />
            </StackItem>
        </Stack>
    );
};

export default ProcessGroup;
