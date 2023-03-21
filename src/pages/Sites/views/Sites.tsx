import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SectionTitle from '@core/components/SectionTitle';
import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { SiteResponse } from 'API/REST.interfaces';

import { QueriesSites } from '../services/services.enum';
import { siteColumns } from '../Sites.constant';
import { SiteLabels, SitesRoutesPaths } from '../Sites.enum';

const Sites = function () {
  const navigate = useNavigate();
  const { data: sites, isLoading } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites(), {
    onError: handleError,
    keepPreviousData: true
  });

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

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
      <>
        <SectionTitle title={SiteLabels.Section} description={SiteLabels.Description} />
        <div>
          <SkTable
            columns={siteColumns}
            rows={sites}
            components={{
              linkCell: (props: LinkCellProps<SiteResponse>) =>
                LinkCell({
                  ...props,
                  type: 'site',
                  link: `${SitesRoutesPaths.Sites}/${props.data.identity}`
                })
            }}
          />
        </div>
      </>
    </TransitionPage>
  );
};

export default Sites;
