import { FC, useCallback, useRef, ComponentType } from 'react';

import { Divider, Stack, StackItem } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { LAYOUT_TOPOLOGY_DEFAULT, LAYOUT_TOPOLOGY_SINGLE_NODE } from '@core/components/Graph/Graph.constants';
import { GraphReactAdaptorExposedMethods, GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';

import AlertToasts, { ToastExposeMethods } from './TopologyToasts';
import TopologyToolbar from './TopologyToolbar';
import useTopologyComponentData from './useTopologyComponentData';
import useTopologyState from './useTopologyState';
import { TopologyController } from '../services';
import { TopologyComponentController } from '../services/topologyComponentController';
import { TopologyLabels } from '../Topology.enum';

const TopologyComponent: FC<{ id?: string[]; GraphComponent?: ComponentType<GraphReactAdaptorProps> }> = function ({
  id,
  GraphComponent = GraphReactAdaptor
}) {
  const navigate = useNavigate();
  const graphRef = useRef<GraphReactAdaptorExposedMethods>();
  const toastRef = useRef<ToastExposeMethods>(null);

  const {
    idSelected,
    showOnlyNeighbours,
    moveToNodeSelected,
    handleSelected,
    handleShowOnlyNeighbours,
    handleMoveToNodeSelectedChecked
  } = useTopologyState({ id });

  const { components, componentsPairs } = useTopologyComponentData({
    idSelected: showOnlyNeighbours ? idSelected : undefined
  });

  const handleShowDetails = useCallback(
    (componentId: string) => {
      const component = components.find(({ identity }) => identity === componentId);

      if (component) {
        navigate(`${ComponentRoutesPaths.ProcessGroups}/${component.name}@${componentId}`);
      }
    },
    [navigate, components]
  );

  const handleSelectedWrapper = useCallback(
    (siteId?: string) => {
      handleSelected(TopologyController.transformStringIdsToIds(siteId));
    },
    [handleSelected]
  );

  const handleShowOnlyNeighboursChecked = useCallback(
    (checked: boolean) => {
      handleShowOnlyNeighbours(checked);
      checked && graphRef?.current?.saveNodePositions();
    },
    [handleShowOnlyNeighbours]
  );

  const handleSavePositions = useCallback(() => {
    graphRef?.current?.saveNodePositions();
    toastRef.current?.addMessage(TopologyLabels.ToastSave);
  }, [graphRef, toastRef]);

  const { nodeIdSelected, nodes, edges } = TopologyComponentController.dataTransformer({
    idSelected,
    components,
    componentsPairs
  });

  return (
    <>
      <Stack>
        <StackItem>
          <TopologyToolbar
            showOnlyNeighbours={showOnlyNeighbours}
            onShowOnlyNeighboursChecked={handleShowOnlyNeighboursChecked}
            moveToNodeSelected={moveToNodeSelected}
            onMoveToNodeSelectedChecked={handleMoveToNodeSelectedChecked}
            onSaveTopology={handleSavePositions}
            resourceIdSelected={nodeIdSelected}
            resourceOptions={nodes.map((node) => ({ name: node.label, identity: node.id }))}
            resourcePlaceholder={TopologyLabels.DisplayComponentsDefaultLabel}
            onResourceSelected={handleSelectedWrapper}
          />
          <Divider />
        </StackItem>

        <StackItem isFilled>
          <GraphComponent
            ref={graphRef}
            nodes={nodes}
            edges={edges}
            itemSelected={nodeIdSelected}
            onClickNode={handleShowDetails}
            layout={showOnlyNeighbours && idSelected ? LAYOUT_TOPOLOGY_SINGLE_NODE : LAYOUT_TOPOLOGY_DEFAULT}
            moveToSelectedNode={moveToNodeSelected && !!idSelected && !showOnlyNeighbours}
          />
        </StackItem>
      </Stack>
      <AlertToasts ref={toastRef} />
    </>
  );
};

export default TopologyComponent;
