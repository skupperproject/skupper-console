import React, { useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { RequestOptions } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import SitesTable from '../components/SitesTable';
import { QueriesSites } from '../services/services.enum';

const Sites = function () {
    const navigate = useNavigate();
    const [options, setOptions] = useState<RequestOptions>({
        limit: DEFAULT_TABLE_PAGE_SIZE,
        offset: 0,
    });

    const { data: sites, isLoading } = useQuery(
        [QueriesSites.GetSites, options],
        () => RESTApi.fetchSites(options),
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

    const handleGetFilters = useCallback((params: RequestOptions) => {
        console.log('');
        setOptions(params);
    }, []);

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <SitesTable
            sites={sites?.results || []}
            onGetFilters={handleGetFilters}
            rowsCount={sites?.totalCount || sites?.results.length || 0}
        />
    );
};

export default Sites;
