import { FC, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';

const ZOOM_CACHE_KEY = 'site-graphZoom';
const FIT_SCREEN_CACHE_KEY = 'site-fitScreen';

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

  const handleSaveZoom = useCallback((zoomValue: number) => {
    localStorage.setItem(ZOOM_CACHE_KEY, `${zoomValue}`);
  }, []);

  const handleFitScreen = useCallback((flag: boolean) => {
    localStorage.setItem(FIT_SCREEN_CACHE_KEY, `${flag}`);
  }, []);

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

  const nodes = TopologyController.convertSitesToNodes(sites);
  const siteLinks = TopologyController.getLinksFromSites(sites, routers, links);

  return (
    <GraphReactAdaptor
      nodes={nodes}
      edges={siteLinks}
      onClickNode={handleGetSelectedNode}
      onGetZoom={handleSaveZoom}
      onFitScreen={handleFitScreen}
      layout={TopologyController.selectLayoutFromNodes(nodes)}
      config={{
        zoom: localStorage.getItem(ZOOM_CACHE_KEY),
        fitScreen: Number(localStorage.getItem(FIT_SCREEN_CACHE_KEY))
      }}
    />
  );
};

export default TopologySite;
