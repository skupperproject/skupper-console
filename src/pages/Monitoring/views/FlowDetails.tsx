import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Stack,
    StackItem,
} from '@patternfly/react-core';
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import FlowInfo from '../components/FlowInfo';
import FlowTopology from '../components/FlowTopology';
import { MonitoringRoutesPathLabel, MonitoringRoutesPaths } from '../Monitoring.enum';
import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';

const CONNECTION_PATH_NAME = 'connection';

const FlowDetails = function () {
    const navigate = useNavigate();
    const { id, idFlow } = useParams();
    const link = `${MonitoringRoutesPaths.Connections}/${idFlow}`;

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: connection, isLoading: isLoadingConnection } = useQuery(
        [QueriesMonitoring.GetMonitoringConnection],
        () => (idFlow ? MonitorServices.fetchConnectionByFlowId(idFlow) : null),
        {
            cacheTime: 0,
            refetchOnWindowFocus: false,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: routers, isLoading: isLoadingTopologyRoutersLinks } = useQuery(
        [QueriesMonitoring.GetMonitoringTopologyNetwork],
        () => MonitorServices.fetchFlowsTopology(),
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
                        <Link to={MonitoringRoutesPaths.Monitoring}>
                            {MonitoringRoutesPathLabel.Monitoring}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={link}>{id}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{CONNECTION_PATH_NAME}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>
            <StackItem>{connection && <FlowInfo connection={connection} />}</StackItem>
            <StackItem>
                <div style={{ width: '100%', height: '300px' }}>
                    {connection && routers && (
                        <FlowTopology connection={connection} routers={routers} />
                    )}
                </div>
            </StackItem>
        </Stack>
    );
};

export default FlowDetails;
