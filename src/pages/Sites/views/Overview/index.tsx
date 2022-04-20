import React, { useState } from 'react';

import {
    Split,
    SplitItem,
    Stack,
    StackItem,
    Text,
    TextContent,
    TextVariants,
} from '@patternfly/react-core';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { UPDATE_INTERVAL } from 'config';

import { SitesServices } from '../../services';
import { QuerySite } from '../../services/services.enum';
import GatewaysTable from './components/GatewayTable';
import ServicesTable from './components/ServicesTable';
import SitesTable from './components/SitesTable';
import { OverviewLabels } from './Overview.enum';

const Overview = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: services, isLoading: isLoadingServices } = useQuery(
        QuerySite.GetServices,
        SitesServices.fetchServices,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: sites, isLoading: isLoadingSites } = useQuery(
        QuerySite.GetSites,
        SitesServices.fetchSites,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    // const {
    //     data: deploymentLinks,
    //     isLoading: isLoadingDeploymentLinks,
    //     dataUpdatedAt,
    // } = useQuery(QuerySite.GetDeploymentLinks, SitesServices.fetchDeploymentLinks, {
    //     refetchInterval,
    //     onError: handleError,
    // });

    function handleError({ httpStatus }: { httpStatus?: number }) {
        const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    if (
        isLoadingServices ||
        isLoadingSites
        //|| isLoadingDeploymentLinks
    ) {
        return <LoadingPage />;
    }

    //     <StackItem>
    //     <TextContent>
    //         <Text component={TextVariants.h2}>{OverviewLabels.TrafficSite}</Text>
    //     </TextContent>
    // </StackItem>

    //     <StackItem>
    //     {deploymentLinks && (
    //         <TrafficChart
    //             totalBytesProps={getTotalBytesBySite({
    //                 direction: 'in',
    //                 deploymentLinks,
    //                 siteId,
    //             })}
    //             timestamp={dataUpdatedAt}
    //         />
    //     )}
    // </StackItem>
    return (
        <Stack>
            <StackItem className="pf-u-mb-xl">
                <TextContent>
                    <Text component={TextVariants.h2}>{OverviewLabels.SiteDetails}</Text>
                </TextContent>
            </StackItem>

            {services && sites && (
                <StackItem className="pf-u-mb-xl">
                    <Split hasGutter>
                        <SplitItem isFilled>
                            <SitesTable sites={sites.filter(({ gateway }) => !gateway)} />
                        </SplitItem>
                        <SplitItem isFilled>
                            <ServicesTable services={services} />
                        </SplitItem>

                        <SplitItem isFilled>
                            <GatewaysTable gateways={sites.filter(({ gateway }) => gateway)} />
                        </SplitItem>
                    </Split>
                </StackItem>
            )}
        </Stack>
    );
};

export default Overview;

// function getTotalBytesBySite({
//     direction,
//     deploymentLinks,
//     siteId,
// }: {
//     direction: string;
//     deploymentLinks: DeploymentLinks[];
//     siteId: string;
// }) {
//     const stat = 'bytes_out';
//     const from = direction === 'out' ? 'source' : 'target';
//     const to = direction === 'out' ? 'target' : 'source';

//     const bytesBySite = deploymentLinks.reduce((acc, deploymentLink) => {
//         const idFrom = deploymentLink[from].site.site_id;
//         const idTo = deploymentLink[to].site.site_id;
//         if (idFrom !== idTo && idFrom === siteId) {
//             acc.push({ name: '', totalBytes: deploymentLink.request[stat] });
//         }

//         return acc;
//     }, [] as TotalByteProps[]);

//     return bytesBySite;
// }
