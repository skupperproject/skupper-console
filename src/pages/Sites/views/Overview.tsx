import React, { useState } from 'react';

import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import SitesOverviewTable from '../components/SitesOverviewTable';
import SitesServices from '../services';
import { QueriesSites } from '../services/services.enum';

const Overview = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: sites, isLoading } = useQuery(QueriesSites.GetSites, SitesServices.fetchSites, {
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

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!sites) {
        return null;
    }

    return <SitesOverviewTable sites={sites} />;
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
