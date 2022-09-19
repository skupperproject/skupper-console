import React, { useState } from 'react';

import {
    Card,
    CardTitle,
    Flex,
    Text,
    TextContent,
    TextVariants,
    Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import ServicesServices from '../services';
import { Labels, ServicesOverviewColumns } from '../Services.enum';
import { QueriesServices } from '../services/services.enum';

const ServicesOverview = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: services, isLoading } = useQuery(
        [QueriesServices.GetServices],
        ServicesServices.getServices,
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

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!services) {
        return null;
    }

    return (
        <Card>
            <CardTitle>
                <Flex>
                    <TextContent>
                        <Text component={TextVariants.h1}>{Labels.Services}</Text>
                    </TextContent>
                    <Tooltip position="right" content={''}>
                        <OutlinedQuestionCircleIcon />
                    </Tooltip>
                </Flex>
            </CardTitle>
            <TableComposable
                className="flows-table"
                borders={false}
                variant="compact"
                isStickyHeader
                isStriped
            >
                <Thead>
                    <Tr>
                        <Th>{ServicesOverviewColumns.Name}</Th>
                    </Tr>
                </Thead>
                {services.map(({ identity, name: serviceName }) => (
                    <Tbody key={identity}>
                        <Tr>
                            <Td>
                                <ResourceIcon type="service" />
                                {serviceName}
                            </Td>
                        </Tr>
                    </Tbody>
                ))}
            </TableComposable>
        </Card>
    );
};

export default ServicesOverview;
