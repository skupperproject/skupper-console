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
import SitesController from '../services';
import { Labels, ServicesRoutesPaths } from '../Services.enum';
import { QueriesServices } from '../services/services.enum';

const Service = function () {
    const navigate = useNavigate();
    const { id: serviceId } = useParams() as { id: string };
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: service, isLoading: isLoadingSite } = useQuery(
        [QueriesServices.GetService, serviceId],
        () => SitesController.getService(serviceId),
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

    if (!service) {
        return null;
    }

    const { name, processes } = service;

    return (
        <Stack hasGutter className="pf-u-pl-md">
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={ServicesRoutesPaths.Services}>{Labels.Services}</Link>
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
                        <Title headingLevel="h2">{Labels.Details}</Title>
                    </CardTitle>
                    <CardBody>
                        <DescriptionList>
                            <DescriptionListGroup>
                                <DescriptionListTerm>{Labels.Name}</DescriptionListTerm>
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

export default Service;
