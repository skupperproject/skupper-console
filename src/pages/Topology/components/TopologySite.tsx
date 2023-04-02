import React, { FC, useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import { UPDATE_INTERVAL } from '@config/config';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';

const TopologySite: FC<{ id?: string | null }> = function () {
  const navigate = useNavigate();
  const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

  const { data: sites, isLoading: isLoadingSites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites(), {
    refetchInterval,
    onError: handleError
  });

  const { data: routers, isLoading: isLoadingRouters } = useQuery(
    [QueriesSites.GetRouters],
    () => RESTApi.fetchRouters(),
    {
      refetchInterval,
      onError: handleError
    }
  );

  const { data: links, isLoading: isLoadingLinks } = useQuery([QueriesSites.GetLinks], () => RESTApi.fetchLinks(), {
    refetchInterval,
    onError: handleError
  });

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  const handleGetSelectedNode = useCallback(
    ({ id, name }: { id: string; name: string }) => {
      navigate(`${SitesRoutesPaths.Sites}/${name}@${id}`);
    },
    [navigate]
  );

  if (isLoadingSites || isLoadingLinks || isLoadingRouters) {
    return <LoadingPage />;
  }

  if (!links || !routers || !sites) {
    return null;
  }

  const edges = TopologyController.getEdgesFromSitesConnected(
    TopologyController.getSitesWithLinksCreated(sites, routers, links)
  );
  const nodes = TopologyController.getNodesFromSitesOrProcessGroups(sites);

  return <GraphReactAdaptor nodes={nodes} edges={edges} onClickNode={handleGetSelectedNode} />;
};

export default TopologySite;
