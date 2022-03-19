import React, { memo, useState } from 'react';

import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { UPDATE_INTERVAL } from '../../App.constant';
import AppContent from '../../layout/AppContent';
import { RoutesPaths } from '../../routes/routes.enum';
import LoadingPage from '../Loading/Loading';
import { SitesServices } from './services';

const Site = memo(() => {
  const navigate = useNavigate();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
  const { data, isLoading } = useQuery('flows', SitesServices.fetchData, {
    refetchInterval,
    onError: handleError,
  });

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? RoutesPaths.ErrServer : RoutesPaths.ErrConnection;

    navigate(route);
    setRefetchInterval(0);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <AppContent header={<div>Header</div>}>
      <pre>{JSON.stringify(data?.data?.sites, null, 2)}</pre>
    </AppContent>
  );
});

export default Site;
