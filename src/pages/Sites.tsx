import React, { memo, useState } from 'react';

import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { UPDATE_INTERVAL } from '../App.constant';
import { RESTServices } from '../models/services/REST';
import { RoutesPaths } from '../routes/routes.enum';
import LoadingPage from './Loading/Loading';

const Sites = memo(() => {
  const navigate = useNavigate();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
  const { data, isLoading } = useQuery('flows', RESTServices.fetchData, {
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

  return <pre>{JSON.stringify(data?.data?.sites, null, 2)}</pre>;
});

export default Sites;
