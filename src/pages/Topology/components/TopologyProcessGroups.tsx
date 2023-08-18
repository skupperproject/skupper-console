import { FC, useCallback } from 'react';

import { Stack, StackItem, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { QueriesProcessGroups } from '@pages/ProcessGroups/services/services.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { TopologyLabels } from '../Topology.enum';

const ZOOM_CACHE_KEY = 'component-graphZoom';
const FIT_SCREEN_CACHE_KEY = 'component-fitScreen';

const processGroupsQueryParams = {
  processGroupRole: 'external'
};

const remoteProcessesQueryParams = {
  processGroupRole: 'remote'
};

const TopologyProcessGroups: FC<{ id?: string }> = function ({ id: processGroupId }) {
  const navigate = useNavigate();

  const { data: processGroups } = useQuery(
    [QueriesProcessGroups.GetProcessGroups, processGroupsQueryParams],
    () => RESTApi.fetchProcessGroups(processGroupsQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: remoteProcessGroups } = useQuery(
    [QueriesTopology.GetRemoteProcessGroups, remoteProcessesQueryParams],
    () => RESTApi.fetchProcessGroups(remoteProcessesQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: processGroupsPairs } = useQuery(
    [QueriesTopology.GetProcessGroupsLinks],
    () => RESTApi.fetchProcessgroupsPairs(),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const handleSaveZoom = useCallback((zoomValue: number) => {
    localStorage.setItem(ZOOM_CACHE_KEY, `${zoomValue}`);
  }, []);

  const handleFitScreen = useCallback((flag: boolean) => {
    localStorage.setItem(FIT_SCREEN_CACHE_KEY, `${flag}`);
  }, []);

  const handleGetSelectedNode = useCallback(
    ({ id: idSelected }: GraphNode) => {
      const component = processGroups?.results.find(({ identity }) => identity === idSelected);

      if (component) {
        navigate(`${ProcessGroupsRoutesPaths.ProcessGroups}/${component.name}@${idSelected}`);
      }
    },
    [navigate, processGroups?.results]
  );

  if (!processGroups || !processGroupsPairs || !remoteProcessGroups) {
    return null;
  }

  const nodes = TopologyController.convertProcessGroupsToNodes([
    ...processGroups.results,
    ...remoteProcessGroups.results
  ]);
  const links = TopologyController.convertProcessPairsToLinks(processGroupsPairs);

  return (
    <Stack>
      <StackItem>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup align={{ default: 'alignRight' }}>
              <ToolbarItem>
                <NavigationViewLink
                  link={ProcessGroupsRoutesPaths.ProcessGroups}
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
          edges={links}
          onClickNode={handleGetSelectedNode}
          itemSelected={processGroupId}
          onGetZoom={handleSaveZoom}
          onFitScreen={handleFitScreen}
          zoom={Number(localStorage.getItem(ZOOM_CACHE_KEY))}
          fitScreen={Number(localStorage.getItem(FIT_SCREEN_CACHE_KEY))}
        />
      </StackItem>
    </Stack>
  );
};

export default TopologyProcessGroups;
