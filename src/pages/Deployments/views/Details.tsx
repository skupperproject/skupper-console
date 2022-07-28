import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Stack,
    StackItem,
    Tab,
    Tabs,
    TabTitleText,
    Title,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { UPDATE_INTERVAL } from 'config';

import Metrics from '../components/Metrics';
import RealTimeMetrics from '../components/RealTimeMetrics';
import TrafficTables from '../components/Traffic';
import { DeploymentsRoutesPaths, DeploymentsRoutesPathLabel } from '../Deployments.enum';
import DeploymentsServices from '../services';
import { QueriesDeployments } from '../services/deployments.enum';
import { DeploymentDetailsLabels } from './Details.enum';
import { DeploymentsOverviewColumns } from './Overview.enum';

const DeploymentsDetails = function () {
    const navigate = useNavigate();
    const { id: deploymentId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [activeTabKey, setaActiveTabKey] = useState<number>();

    const {
        data: deployment,
        isLoading,
        dataUpdatedAt,
    } = useQuery(
        [QueriesDeployments.GetDeployments, deploymentId],
        () => DeploymentsServices.fetchDeployment(deploymentId),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    function handleTabClick(
        _: React.MouseEvent<HTMLElement, MouseEvent>,
        tabIndex: number | string,
    ) {
        setaActiveTabKey(tabIndex as number);
    }

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

    if (!deployment) {
        return null;
    }

    const { tcpConnectionsIn, tcpConnectionsOut, httpRequestsSent, httpRequestsReceived } =
        deployment;

    const { service, site } = deployment;

    const deploymentName = `${site.site_name}/${service.address}`;

    return (
        <Stack hasGutter className="pf-u-pl-md">
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={DeploymentsRoutesPaths.Deployments}>
                            {DeploymentsRoutesPathLabel.Deployments}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{deploymentId?.split('_')[0]}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <Title headingLevel="h1">
                <ResourceIcon type="deployment" />
                {deploymentName}
            </Title>

            <div className="pf-u-mb-lg">
                <div className="  pf-u-font-weight-bold">{DeploymentsOverviewColumns.Site}</div>
                <span>
                    <Link to={`${SitesRoutesPaths.Details}/${site.site_id}`}>
                        <SearchIcon /> {site.site_name}
                    </Link>
                </span>
            </div>

            <div className="pf-u-mb-lg">
                <div className="  pf-u-font-weight-bold">{DeploymentsOverviewColumns.Service}</div>
                <span>
                    <ResourceIcon type="service" />
                    {service.address}
                </span>
            </div>

            <div className="pf-u-mb-lg">
                <div className="  pf-u-font-weight-bold">{DeploymentsOverviewColumns.Protocol}</div>
                <span>{service.protocol}</span>
            </div>

            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
                <Tab
                    eventKey={0}
                    title={<TabTitleText>{DeploymentDetailsLabels.TabTraffic}</TabTitleText>}
                >
                    <TrafficTables
                        httpConnectionsIn={httpRequestsReceived}
                        httpConnectionsOut={httpRequestsSent}
                        tcpConnectionsOut={tcpConnectionsOut}
                        tcpConnectionsIn={tcpConnectionsIn}
                    />
                </Tab>
                <Tab
                    eventKey={1}
                    title={<TabTitleText>{DeploymentDetailsLabels.TabMetrics}</TabTitleText>}
                >
                    <Metrics
                        deploymentName={deploymentName}
                        httpRequestsReceived={httpRequestsReceived}
                        httpRequestsSent={httpRequestsSent}
                        tcpConnectionsIn={tcpConnectionsIn}
                        tcpConnectionsOut={tcpConnectionsOut}
                    />

                    <RealTimeMetrics
                        deploymentName={deploymentName}
                        httpRequestsReceived={httpRequestsReceived}
                        httpRequestsSent={httpRequestsSent}
                        tcpConnectionsIn={tcpConnectionsIn}
                        tcpConnectionsOut={tcpConnectionsOut}
                        timestamp={dataUpdatedAt}
                    />
                </Tab>
            </Tabs>
        </Stack>
    );
};

export default DeploymentsDetails;
