import { FC, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import { UPDATE_INTERVAL } from '@config/config';
import { GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';

const TopologySite: FC<{ id?: string | null }> = function () {
  const navigate = useNavigate();

  const { data: sites, isLoading: isLoadingSites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites(), {
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: routers, isLoading: isLoadingRouters } = useQuery(
    [QueriesSites.GetRouters],
    () => RESTApi.fetchRouters(),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: links, isLoading: isLoadingLinks } = useQuery([QueriesSites.GetLinks], () => RESTApi.fetchLinks(), {
    refetchInterval: UPDATE_INTERVAL
  });

  const handleGetSelectedNode = useCallback(
    ({ id, label }: GraphNode) => {
      navigate(`${SitesRoutesPaths.Sites}/${label}@${id}`);
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
