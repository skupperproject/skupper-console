import { FC, useCallback } from 'react';

import { Stack, StackItem, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { ProcessGroupsRoutesPaths, QueriesProcessGroups } from '@pages/ProcessGroups/ProcessGroups.enum';

import { TopologyController } from '../services';
import { TopologyLabels, QueriesTopology } from '../Topology.enum';

const ZOOM_CACHE_KEY = 'component';

const processGroupsQueryParams = {
  processGroupRole: 'external'
};

const remoteProcessesQueryParams = {
  processGroupRole: 'remote'
};

const TopologyProcessGroups: FC<{ id?: string }> = function ({ id: processGroupId }) {
  const navigate = useNavigate();

  const [{ data: processGroups }, { data: remoteProcessGroups }, { data: processGroupsPairs }] = useQueries({
    queries: [
      {
        queryKey: [QueriesProcessGroups.GetProcessGroups, processGroupsQueryParams],
        queryFn: () => RESTApi.fetchProcessGroups(processGroupsQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcessGroups.GetRemoteProcessGroup, remoteProcessesQueryParams],
        queryFn: () => RESTApi.fetchProcessGroups(remoteProcessesQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesTopology.GetProcessGroupsLinks],
        queryFn: () => RESTApi.fetchProcessgroupsPairs(),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

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
          saveConfigkey={ZOOM_CACHE_KEY}
        />
      </StackItem>
    </Stack>
  );
};

export default TopologyProcessGroups;
