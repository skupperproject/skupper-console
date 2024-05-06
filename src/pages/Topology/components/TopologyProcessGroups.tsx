import { FC, useCallback, useRef, useState, ComponentType } from 'react';

import { Divider, Stack, StackItem } from '@patternfly/react-core';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { LAYOUT_TOPOLOGY_DEFAULT, LAYOUT_TOPOLOGY_SINGLE_NODE } from '@core/components/Graph/Graph.constants';
import {
  GraphNode,
  GraphReactAdaptorExposedMethods,
  GraphReactAdaptorProps
} from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import { ProcessGroupsRoutesPaths, QueriesProcessGroups } from '@pages/ProcessGroups/ProcessGroups.enum';

import AlertToasts, { ToastExposeMethods } from './TopologyToasts';
import TopologyToolbar from './TopologyToolbar';
import { TopologyController } from '../services';
import { TopologyLabels, QueriesTopology } from '../Topology.enum';

const processGroupsQueryParams = {
  processGroupRole: ['remote', 'external'],
  endTime: 0
};

const TopologyProcessGroups: FC<{ id?: string; GraphComponent?: ComponentType<GraphReactAdaptorProps> }> = function ({
  id: componentId,
  GraphComponent = GraphReactAdaptor
}) {
  const navigate = useNavigate();

  const [componentIdSelected, setComponentIdSelected] = useState<string | undefined>(componentId);

  const [showOnlyNeighbours, setShowOnlyNeighbours] = useState(false);
  const [moveToNodeSelected, setMoveToNodeSelected] = useState(false);

  const graphRef = useRef<GraphReactAdaptorExposedMethods>();
  const toastRef = useRef<ToastExposeMethods>(null);

  const [{ data: processGroups }, { data: processGroupsPairs }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcessGroups.GetProcessGroups, processGroupsQueryParams],
        queryFn: () => RESTApi.fetchProcessGroups(processGroupsQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },

      {
        queryKey: [QueriesTopology.GetProcessGroupsPairs],
        queryFn: () => RESTApi.fetchProcessGroupsPairs(),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const handleSaveTopology = useCallback(() => {
    graphRef?.current?.saveNodePositions();
    toastRef.current?.addMessage(TopologyLabels.ToastSave);
  }, []);

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

  const handleShowOnlyNeighboursChecked = useCallback((checked: boolean) => {
    if (checked) {
      graphRef?.current?.saveNodePositions();
    }

    setShowOnlyNeighbours(checked);
  }, []);

  const handleMoveToNodeSelectedChecked = useCallback((checked: boolean) => {
    setMoveToNodeSelected(checked);
  }, []);

  const nodes = TopologyController.convertProcessGroupsToNodes([...processGroups.results]);
  const links = TopologyController.convertPairsToEdges(processGroupsPairs);

  let filteredLinks = links;
  let filteredNodes = nodes;

  if (showOnlyNeighbours && componentIdSelected) {
    filteredLinks = links.filter((edge) => edge.source === componentIdSelected || edge.target === componentIdSelected);
    const idsFromService = filteredLinks.flatMap(({ source, target }) => [source, target]);
    filteredNodes = nodes.filter(({ id }) => idsFromService.includes(id));
  }

  return (
    <>
      <Stack>
        <StackItem>
          <TopologyToolbar
            nodes={nodes}
            onProcessSelected={handleComponentSelected}
            nodeIdSelected={componentIdSelected}
            showOnlyNeighbours={showOnlyNeighbours}
            onShowOnlyNeighboursChecked={handleShowOnlyNeighboursChecked}
            moveToNodeSelected={moveToNodeSelected}
            onMoveToNodeSelectedChecked={handleMoveToNodeSelectedChecked}
            onSaveTopology={handleSaveTopology}
            linkToPage={ProcessGroupsRoutesPaths.ProcessGroups}
            resourcePlaceholder={TopologyLabels.DisplayComponentsDefaultLabel}
          />
          <Divider />
        </StackItem>

        <StackItem isFilled>
          <GraphComponent
            ref={graphRef}
            nodes={filteredNodes}
            edges={filteredLinks}
            onClickNode={handleGetSelectedNode}
            itemSelected={componentIdSelected}
            layout={showOnlyNeighbours && componentIdSelected ? LAYOUT_TOPOLOGY_SINGLE_NODE : LAYOUT_TOPOLOGY_DEFAULT}
            moveToSelectedNode={moveToNodeSelected && !!componentIdSelected && !showOnlyNeighbours}
          />
        </StackItem>
      </Stack>
      <AlertToasts ref={toastRef} />
    </>
  );
};

export default TopologyProcessGroups;
