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
    Text,
    TextContent,
    TextVariants,
} from '@patternfly/react-core';
import { useQuery } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import MetricsRealTime from '../components/MetricsRealTime';
import { SitesOverviewColumns } from '../components/SitesOverviewTable.enum';
import SitesServices from '../services';
import { QueriesSites } from '../services/services.enum';
import { SitesRoutesPaths, SitesRoutesPathLabel } from '../sites.enum';
import SitesConnections from './Connections';
import { SitesDetailsLabels } from './Details.enum';
import SitesMetrics from './Metrics';

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

            <TextContent>
                <Text component={TextVariants.h1} className="pf-u-mb-xl pf-u-font-weight-bold">
                    <ResourceIcon type="site" />
                    {site.siteName}
                </Text>
            </TextContent>

            <TextContent>
                <Text component={TextVariants.h2}>{SitesDetailsLabels.Details}</Text>
            </TextContent>

            <Split>
                <SplitItem className="pf-u-w-50">
                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">{SitesOverviewColumns.Name}</div>
                        <span>{site.siteName}</span>
                    </div>

                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">
                            {SitesOverviewColumns.Namespace}
                        </div>
                        <span>{site.namespace}</span>
                    </div>

                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">
                            {SitesOverviewColumns.Version}
                        </div>
                        <span>{site.version}</span>
                    </div>

                    <div className="pf-u-mb-lg">
                        <div className="  pf-u-font-weight-bold">
                            {SitesOverviewColumns.Gateway}
                        </div>
                        <span>{site.gateway ? 'Yes' : 'No'}</span>
                    </div>
                </SplitItem>

                <SplitItem className="pf-u-w-50">
                    <div className="pf-u-mb-lg">
                        <div className="pf-u-font-weight-bold">
                            {SitesOverviewColumns.RouterHostname}
                        </div>
                        <span>{site.url}</span>
                    </div>
                </SplitItem>
            </Split>

            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
                <Tab
                    eventKey={0}
                    title={<TabTitleText>{SitesDetailsLabels.TabTraffic}</TabTitleText>}
                >
                    <SitesConnections
                        httpRequestsReceived={site.httpRequestsReceived}
                        httpRequestsSent={site.httpRequestsSent}
                        tcpConnectionsIn={site.tcpConnectionsIn}
                        tcpConnectionsOut={site.tcpConnectionsOut}
                    />
                </Tab>
                <Tab
                    eventKey={1}
                    title={<TabTitleText>{SitesDetailsLabels.TabMetrics}</TabTitleText>}
                >
                    <SitesMetrics
                        siteName={site.siteName}
                        httpRequestsReceived={site.httpRequestsReceived}
                        httpRequestsSent={site.httpRequestsSent}
                        tcpConnectionsIn={site.tcpConnectionsIn}
                        tcpConnectionsOut={site.tcpConnectionsOut}
                    />
                </Tab>
                <Tab
                    eventKey={2}
                    title={<TabTitleText>{SitesDetailsLabels.RealTime}</TabTitleText>}
                >
                    <MetricsRealTime
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
