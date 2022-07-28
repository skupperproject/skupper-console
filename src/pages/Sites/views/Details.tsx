import React, { useState } from 'react';

import {
    Breadcrumb,
    BreadcrumbHeading,
    BreadcrumbItem,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Tab,
    Tabs,
    TabTitleText,
    Title,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import DescriptionItem from '../components/DescriptionItem';
import Metrics from '../components/Metrics';
import RealTimeMetrics from '../components/RealTimeMetrics';
import { SitesListColumns } from '../components/SitesList.enum';
import Connections from '../components/Traffic';
import SitesServices from '../services';
import { QueriesSites } from '../services/services.enum';
import { SitesRoutesPaths, SitesRoutesPathLabel } from '../Sites.enum';
import { SitesDetailsLabels } from './Details.enum';

const SiteDetail = function () {
    const navigate = useNavigate();
    const { id: siteId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [activeTabKey, setaActiveTabKey] = useState<number>();

    const { data: site, isLoading: isLoadingSite } = useQuery(
        [QueriesSites.GetSite, siteId],
        () => (siteId ? SitesServices.fetchSite(siteId) : null),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: traffic, isLoading: isLoadingTraffic } = useQuery(
        [QueriesSites.GetSiteTraffic, siteId],
        () => (siteId ? SitesServices.fetchTraffic(siteId) : null),
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

    function handleTabClick(
        _: React.MouseEvent<HTMLElement, MouseEvent>,
        tabIndex: number | string,
    ) {
        setaActiveTabKey(tabIndex as number);
    }

    if (isLoadingSite && isLoadingTraffic) {
        return <LoadingPage />;
    }

    if (!site || !traffic) {
        return null;
    }

    const {
        httpRequests,
        tcpRequests,
        httpRequestsReceived,
        httpRequestsSent,
        tcpConnectionsIn,
        tcpConnectionsOut,
    } = traffic;

    return (
        <Stack hasGutter className="pf-u-pl-md">
            <StackItem>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={SitesRoutesPaths.Sites}>{SitesRoutesPathLabel.Sites}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbHeading to="#">{site.siteName}</BreadcrumbHeading>
                </Breadcrumb>
            </StackItem>

            <Title headingLevel="h1">
                <ResourceIcon type="site" />
                {site.siteName}
            </Title>

            <Split>
                <SplitItem className="pf-u-w-50">
                    <DescriptionItem title={SitesListColumns.Name} value={site.siteName} />
                    <DescriptionItem title={SitesListColumns.Namespace} value={site.namespace} />
                    <DescriptionItem title={SitesListColumns.Version} value={site.version} />
                    <DescriptionItem
                        title={SitesListColumns.Gateway}
                        value={site.gateway ? 'Yes' : 'No'}
                    />
                </SplitItem>

                <SplitItem className="pf-u-w-50">
                    <DescriptionItem title={SitesListColumns.RouterHostname} value={site.url} />
                </SplitItem>
            </Split>

            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
                <Tab
                    eventKey={0}
                    title={<TabTitleText>{SitesDetailsLabels.TabTraffic}</TabTitleText>}
                >
                    <Connections
                        siteName={site.siteName}
                        httpRequests={httpRequests}
                        tcpRequests={tcpRequests}
                    />
                </Tab>
                <Tab
                    eventKey={1}
                    title={<TabTitleText>{SitesDetailsLabels.TabMetrics}</TabTitleText>}
                >
                    <Metrics
                        siteName={site.siteName}
                        httpRequestsReceived={httpRequestsReceived}
                        httpRequestsSent={httpRequestsSent}
                        tcpConnectionsIn={tcpConnectionsIn}
                        tcpConnectionsOut={tcpConnectionsOut}
                    />

                    <RealTimeMetrics
                        siteName={site.siteName}
                        httpRequestsReceived={httpRequestsReceived}
                        httpRequestsSent={httpRequestsSent}
                        tcpConnectionsIn={tcpConnectionsIn}
                        tcpConnectionsOut={tcpConnectionsOut}
                    />
                </Tab>
            </Tabs>
        </Stack>
    );
};

export default SiteDetail;