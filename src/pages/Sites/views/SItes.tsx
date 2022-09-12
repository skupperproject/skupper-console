import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import SitesTable from '../components/SitesTable';
import SitesServices from '../services';
import { QueriesSites } from '../services/services.enum';

const Sites = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: sites, isLoading } = useQuery([QueriesSites.GetSites], SitesServices.getSites, {
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

    return <SitesTable sites={sites || []} />;
};

export default Sites;
