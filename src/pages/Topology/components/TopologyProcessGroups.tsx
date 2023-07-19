import { FC, useCallback } from 'react';

import { Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ListIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { QueriesProcessGroups } from '@pages/ProcessGroups/services/services.enum';
import LoadingPage from '@pages/shared/Loading';

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

  const { data: processGroups, isLoading: isLoadingProcessGroups } = useQuery(
    [QueriesProcessGroups.GetProcessGroups, processGroupsQueryParams],
    () => RESTApi.fetchProcessGroups(processGroupsQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: remoteProcessGroups, isLoading: isLoadingRemoteProcessGroups } = useQuery(
    [QueriesTopology.GetRemoteProcessGroups, remoteProcessesQueryParams],
    () => RESTApi.fetchProcessGroups(remoteProcessesQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: processGroupsPairs, isLoading: isLoadingProcessGroupsPairs } = useQuery(
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
    ({ id, label }: GraphNode) => {
      navigate(`${ProcessGroupsRoutesPaths.ProcessGroups}/${label}@${id}`);
    },
    [navigate]
  );

  if (isLoadingProcessGroups || isLoadingProcessGroupsPairs || isLoadingRemoteProcessGroups) {
    return <LoadingPage />;
  }

  if (!processGroups || !processGroupsPairs || !remoteProcessGroups) {
    return null;
  }

  const nodes = TopologyController.convertProcessGroupsToNodes([
    ...processGroups.results,
    ...remoteProcessGroups.results
  ]);
  const links = TopologyController.convertProcessPairsToLinks(processGroupsPairs);

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarGroup alignment={{ default: 'alignRight' }}>
            <ToolbarItem>
              <Link to={ProcessGroupsRoutesPaths.ProcessGroups}>
                <Tooltip content={TopologyLabels.TableView}>
                  <ListIcon />
                </Tooltip>
              </Link>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>

      <GraphReactAdaptor
        nodes={nodes}
        edges={links}
        onClickNode={handleGetSelectedNode}
        itemSelected={processGroupId}
        onGetZoom={handleSaveZoom}
        onFitScreen={handleFitScreen}
        layout={TopologyController.selectLayoutFromNodes(nodes)}
        config={{
          zoom: localStorage.getItem(ZOOM_CACHE_KEY),
          fitScreen: Number(localStorage.getItem(FIT_SCREEN_CACHE_KEY))
        }}
      />
    </>
  );
};

export default TopologyProcessGroups;
