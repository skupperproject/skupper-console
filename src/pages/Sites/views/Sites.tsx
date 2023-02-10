import React from 'react';

import { Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';

import SiteNameLinkCell from '../components/SiteNameLinkCell';
import { QueriesSites } from '../services/services.enum';
import { siteColumns } from '../Sites.constant';
import { SiteLabels } from '../Sites.enum';

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

    if (!sites) {
        return null;
    }

    return (
        <TransitionPage>
            <Grid hasGutter>
                <GridItem>
                    <SkTable
                        title={SiteLabels.Sites}
                        titleDescription={SiteLabels.SitesDescription}
                        columns={siteColumns}
                        rows={sites}
                        components={{ linkCell: SiteNameLinkCell }}
                    />
                </GridItem>
            </Grid>
        </TransitionPage>
    );
};

export default Sites;
