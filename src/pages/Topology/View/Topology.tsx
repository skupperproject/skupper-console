import React, { useState } from 'react';

import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import SitesServices from '@pages/Sites/services';
import { UPDATE_INTERVAL } from 'config';

import TopologySVGContainer from '../components/TopologySVGContainer';
import { TopologyServices } from '../services';
import { QueryTopology } from '../services/services.enum';

const TopologyContent = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: sites, isLoading: isLoadingSites } = useQuery(
        QueryTopology.GetSites,
        SitesServices.fetchSites,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: deployments, isLoading: isLoadingServices } = useQuery(
        QueryTopology.GetDeployments,
        TopologyServices.fetchDeployments,
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

    if (isLoadingSites || isLoadingServices) {
        return <LoadingPage />;
    }

    return (
        <TopologySVGContainer
            sites={sites || []}
            deployments={deployments || { deployments: [], deploymentLinks: [] }}
        />
    );
};

export default TopologyContent;
