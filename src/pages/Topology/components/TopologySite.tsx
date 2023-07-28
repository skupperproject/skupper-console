import { FC, useCallback } from 'react';

import { Stack, StackItem, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';
import { TopologyLabels } from '../Topology.enum';

const ZOOM_CACHE_KEY = 'site-graphZoom';
const FIT_SCREEN_CACHE_KEY = 'site-fitScreen';

const TopologySite: FC<{ id?: string | null }> = function () {
  const navigate = useNavigate();

  const { data: sites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites(), {
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: routers } = useQuery([QueriesSites.GetRouters], () => RESTApi.fetchRouters(), {
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: links } = useQuery([QueriesSites.GetLinks], () => RESTApi.fetchLinks(), {
    refetchInterval: UPDATE_INTERVAL
  });

  const handleSaveZoom = useCallback((zoomValue: number) => {
    localStorage.setItem(ZOOM_CACHE_KEY, `${zoomValue}`);
  }, []);

  const handleFitScreen = useCallback((flag: boolean) => {
    localStorage.setItem(FIT_SCREEN_CACHE_KEY, `${flag}`);
  }, []);

  const handleGetSelectedNode = useCallback(
    ({ id: idSelected }: GraphNode) => {
      const site = sites?.find(({ identity }) => identity === idSelected);

      navigate(`${SitesRoutesPaths.Sites}/${site?.name}@${idSelected}`);
    },
    [sites, navigate]
  );

  if (!links || !routers || !sites) {
    return null;
  }

  const nodes = TopologyController.convertSitesToNodes(sites);
  const siteLinks = TopologyController.getLinksFromSites(sites, routers, links);

  return (
    <Stack>
      <StackItem>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup align={{ default: 'alignRight' }}>
              <ToolbarItem>
                <NavigationViewLink
                  link={SitesRoutesPaths.Sites}
                  linkLabel={TopologyLabels.ListView}
                  iconName="listIcon"
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </StackItem>

      <StackItem isFilled>
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
      </StackItem>
    </Stack>
  );
};

export default TopologySite;
