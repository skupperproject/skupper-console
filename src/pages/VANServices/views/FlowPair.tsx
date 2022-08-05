import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Stack,
    StackItem,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import FlowPairDetails from '../components/FlowPairDetails';
import FlowPairTopologyContainer from '../components/FlowPairTopologyContainer';
import { MonitorServices } from '../services';
import { QueriesVANServices } from '../services/services.enum';
import { VanServicesRoutesPathLabel, VANServicesRoutesPaths } from '../VANServices.enum';

const CONNECTION_PATH_NAME = 'connection';
const TOPOLOGY_CONTAINER_HEIGHT = 500;

const FlowPair = function () {
    const navigate = useNavigate();
    const { id, idFlow } = useParams();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: connection, isLoading: isLoadingConnection } = useQuery(
        [QueriesVANServices.GetFlowPair],
        () => (idFlow ? MonitorServices.fetchFlowPairByFlowId(idFlow) : null),
        {
            cacheTime: 0,
            refetchOnWindowFocus: false,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: routers, isLoading: isLoadingTopologyRoutersLinks } = useQuery(
        [QueriesVANServices.GetFlowPairTopologyNetwork],
        () => MonitorServices.fetchFlowPairTopology(),
        {
            refetchOnWindowFocus: false,
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

    if (isLoadingConnection || isLoadingTopologyRoutersLinks) {
        return <LoadingPage />;
    }

    return (
        <Stack hasGutter>
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={VANServicesRoutesPaths.VANServices}>
                            {VanServicesRoutesPathLabel.VanServices}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={`${VANServicesRoutesPaths.FlowsPairs}/${id}`}>{id}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{CONNECTION_PATH_NAME}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>
            <StackItem>{connection && <FlowPairDetails connection={connection} />}</StackItem>
            <StackItem>
                <div style={{ width: '100%', height: `${TOPOLOGY_CONTAINER_HEIGHT}px` }}>
                    {connection && routers && (
                        <FlowPairTopologyContainer connection={connection} routers={routers} />
                    )}
                </div>
            </StackItem>
        </Stack>
    );
};

export default FlowPair;
