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
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import Connections from '../components/Connections';
import DescriptionItem from '../components/DescriptionItem';
import Metrics from '../components/Metrics';
import RealTimeMetrics from '../components/RealTimeMetrics';
import { SitesListColumns } from '../components/SitesList.enum';
import SitesServices from '../services';
import { QueriesSites } from '../services/services.enum';
import { SitesRoutesPaths, SitesRoutesPathLabel } from '../sites.enum';
import { SitesDetailsLabels } from './Details.enum';

const SiteDetail = function () {
    const navigate = useNavigate();
    const { id: siteId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
    const [activeTabKey, setaActiveTabKey] = useState<number>();

    const {
        data: site,
        isLoading,
        dataUpdatedAt,
    } = useQuery([QueriesSites.GetSite, siteId], () => SitesServices.fetchSite(siteId), {
        refetchInterval,
        onError: handleError,
    });

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

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!site) {
        return null;
    }

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
                        httpRequests={site.httpRequests}
                        tcpRequests={site.tcpRequests}
                    />
                </Tab>
                <Tab
                    eventKey={1}
                    title={<TabTitleText>{SitesDetailsLabels.TabMetrics}</TabTitleText>}
                >
                    <Metrics
                        siteName={site.siteName}
                        httpRequestsReceived={site.httpRequestsReceived}
                        httpRequestsSent={site.httpRequestsSent}
                        tcpConnectionsIn={site.tcpConnectionsIn}
                        tcpConnectionsOut={site.tcpConnectionsOut}
                    />

                    <RealTimeMetrics
                        siteName={site.siteName}
                        httpRequestsReceived={site.httpRequestsReceived}
                        httpRequestsSent={site.httpRequestsSent}
                        tcpConnectionsIn={site.tcpConnectionsIn}
                        tcpConnectionsOut={site.tcpConnectionsOut}
                        timestamp={dataUpdatedAt}
                    />
                </Tab>
            </Tabs>
        </Stack>
    );
};

export default SiteDetail;
