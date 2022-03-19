import React, { useState } from 'react';

import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { UPDATE_INTERVAL } from '../../App.constant';
import AppContent from '../../layout/AppContent';
import { RoutesPaths } from '../../routes/routes.enum';
import LoadingPage from '../Loading';
import Overview from './components/Overview';
import SiteMenu from './components/SiteMenu';
import { SitesServices } from './services';
import { QuerySite } from './site.enum';

const Site = function () {
  const navigate = useNavigate();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
  const { data: site, isLoading } = useQuery(QuerySite.getSiteInfo, SitesServices.fetchData, {
    refetchInterval,
    onError: handleError,
  });

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? RoutesPaths.ErrServer : RoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <AppContent header={<SiteMenu />}>
      <Overview data={site} />
    </AppContent>
  );
};

export default Site;
