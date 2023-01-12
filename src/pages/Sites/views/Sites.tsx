import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';

import SitesTable from '../components/SitesTable';
import { QueriesSites } from '../services/services.enum';

const Sites = function () {
    const navigate = useNavigate();
    const { data: sites, isLoading } = useQuery(
        [QueriesSites.GetSites],
        () => RESTApi.fetchSites(),
        {
            onError: handleError,
            keepPreviousData: true,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        navigate(route);
    }

    if (isLoading) {
        return <LoadingPage />;
    }

    return <SitesTable sites={sites || []} />;
};

export default Sites;
