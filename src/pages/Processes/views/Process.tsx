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

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    if (isLoadingProcess) {
        return <LoadingPage />;
    }

    if (!process) {
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
                            <DescriptionListGroup>
                                <DescriptionListTerm>{ProcessesLabels.Name}</DescriptionListTerm>
                                <DescriptionListDescription>{name}</DescriptionListDescription>
                            </DescriptionListGroup>

                            <DescriptionListGroup>
                                <DescriptionListTerm>
                                    {ProcessesLabels.SourceIP}
                                </DescriptionListTerm>
                                <DescriptionListDescription>
                                    {sourceHost}
                                </DescriptionListDescription>
                            </DescriptionListGroup>

                            <DescriptionListGroup>
                                <DescriptionListTerm>{ProcessesLabels.Host}</DescriptionListTerm>
                                <DescriptionListDescription>{hostName}</DescriptionListDescription>
                            </DescriptionListGroup>

                            <DescriptionListGroup>
                                <DescriptionListTerm>{ProcessesLabels.Image}</DescriptionListTerm>
                                <DescriptionListDescription>{imageName}</DescriptionListDescription>
                            </DescriptionListGroup>
                        </DescriptionList>
                    </CardBody>
                </Card>
            </GridItem>
        </Grid>
    );
};

export default Process;
