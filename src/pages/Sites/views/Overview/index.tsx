import React, { useState } from 'react';

import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import SitesServices from '../../services';
import { QueriesSites } from '../../services/services.enum';
import SitesTable from './components/SitesTable';

const Overview = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: sites, isLoading } = useQuery(QueriesSites.GetSites, SitesServices.fetchSites, {
        refetchInterval,
        onError: handleError,
    });

    function handleError({ httpStatus }: { httpStatus?: number }) {
        const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    if (isLoading) {
        return <LoadingPage />;
    }

    return <SitesTable sites={sites || []} />;
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
