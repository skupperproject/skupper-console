import { FC, useCallback, useRef, useState } from 'react';

import { Divider, Stack, StackItem, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { GraphNode, GraphReactAdaptorExposedMethods } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { ProcessGroupsRoutesPaths, QueriesProcessGroups } from '@pages/ProcessGroups/ProcessGroups.enum';
import LoadingPage from '@pages/shared/Loading';

import DisplayResource from './DisplayResources';
import { TopologyController } from '../services';
import { TopologyLabels, QueriesTopology } from '../Topology.enum';

const ZOOM_CACHE_KEY = 'component';

const processGroupsQueryParams = {
  processGroupRole: 'external'
};

const remoteProcessesQueryParams = {
  processGroupRole: 'remote'
};

const TopologyProcessGroups: FC<{ id?: string }> = function ({ id: componentId }) {
  const navigate = useNavigate();

  const [componentIdSelected, setComponentIdSelected] = useState<string | undefined>(componentId);
  const graphRef = useRef<GraphReactAdaptorExposedMethods>();

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
        queryKey: [QueriesTopology.GetProcessGroupsPairs],
        queryFn: () => RESTApi.fetchProcessGroupsPairs(),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const handleComponentSelected = useCallback((id?: string) => {
    setComponentIdSelected(id);
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
    return <LoadingPage />;
  }

  const nodes = TopologyController.convertProcessGroupsToNodes([
    ...processGroups.results,
    ...remoteProcessGroups.results
  ]);
  const links = TopologyController.convertPairsToEdges(processGroupsPairs);

  return (
    <Stack>
      <StackItem>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <DisplayResource
                type={'component'}
                id={componentIdSelected}
                onSelect={handleComponentSelected}
                placeholder={TopologyLabels.DisplayComponentsDefaultLabel}
              />
            </ToolbarItem>

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
        <Divider />
      </StackItem>

      <StackItem isFilled>
        <GraphReactAdaptor
          ref={graphRef}
          nodes={nodes}
          edges={links}
          onClickNode={handleGetSelectedNode}
          itemSelected={componentIdSelected}
          saveConfigkey={ZOOM_CACHE_KEY}
        />
      </StackItem>
    </Stack>
  );
};

export default TopologyProcessGroups;
