import { FC, useCallback, useRef, ComponentType } from 'react';

import { Divider, Stack, StackItem } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';

import AlertToasts, { ToastExposeMethods } from './TopologyToasts';
import TopologyToolbar from './TopologyToolbar';
import useTopologyComponentData from './useTopologyComponentData';
import useTopologyState from './useTopologyState';
import { TopologyController } from '../services';
import { TopologyComponentController } from '../services/topologyComponentController';
import { TopologyLabels } from '../Topology.enum';

const TopologyComponent: FC<{ ids?: string[]; GraphComponent?: ComponentType<GraphReactAdaptorProps> }> = function ({
  ids,
  GraphComponent = GraphReactAdaptor
}) {
  const navigate = useNavigate();
  const toastRef = useRef<ToastExposeMethods>(null);

  const {
    idsSelected,
    showOnlyNeighbours,
    moveToNodeSelected,
    handleSelected,
    handleShowOnlyNeighbours,
    handleMoveToNodeSelectedChecked
  } = useTopologyState({ ids });

  const { components, componentsPairs } = useTopologyComponentData({
    idSelected: showOnlyNeighbours ? idsSelected : undefined
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
    },
    [handleShowOnlyNeighbours]
  );

  const { nodeIdSelected, nodes, edges } = TopologyComponentController.dataTransformer({
    idsSelected,
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
            resourceIdSelected={nodeIdSelected}
            resourceOptions={nodes.map((node) => ({ name: node.label, identity: node.id }))}
            resourcePlaceholder={TopologyLabels.DisplayComponentsDefaultLabel}
            onResourceSelected={handleSelectedWrapper}
          />
          <Divider />
        </StackItem>

        <StackItem isFilled>
          {showOnlyNeighbours && (
            <GraphComponent
              nodes={nodes}
              edges={edges}
              itemSelected={nodeIdSelected}
              layout="neighbour"
              savePositions={false}
            />
          )}

          {!showOnlyNeighbours && (
            <GraphComponent
              nodes={nodes}
              edges={edges}
              itemSelected={nodeIdSelected}
              onClickNode={handleShowDetails}
              moveToSelectedNode={moveToNodeSelected && !!idsSelected}
            />
          )}
        </StackItem>
      </Stack>
      <AlertToasts ref={toastRef} />
    </>
  );
};

export default TopologyComponent;
