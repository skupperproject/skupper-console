import React, { useState } from 'react';

import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';

import { UPDATE_INTERVAL } from '../../config';
import { SitesServices } from './services';
import { QuerySite } from './site.enum';

const Deployments = function () {
  const navigate = useNavigate();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
  const { data: site, isLoading } = useQuery(QuerySite.GetDeployments, SitesServices.fetchData, {
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

  return <pre>{JSON.stringify(site, null, 2)}</pre>;
};

export default Deployments;
