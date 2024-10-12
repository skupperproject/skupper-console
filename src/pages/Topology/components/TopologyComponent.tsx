import { FC, useCallback, ComponentType } from 'react';

import { Divider, Stack, StackItem } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import SkGraph from '@core/components/SkGraph';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/Components.enum';
import { GraphNode, SkGraphProps } from 'types/Graph.interfaces';

import TopologyToolbar from './TopologyToolbar';
import useTopologyComponentData from '../hooks/useTopologyComponentData';
import useTopologyState from '../hooks/useTopologyState';
import { TopologyComponentController } from '../services/topologyComponentController';
import { TopologyLabels } from '../Topology.enum';

const TopologyComponent: FC<{ ids?: string[]; GraphComponent?: ComponentType<SkGraphProps> }> = function ({
  ids,
  GraphComponent = SkGraph
}) {
  const navigate = useNavigate();

  const { idsSelected, searchText, handleSearchText } = useTopologyState({ ids });
  const { components, componentsPairs } = useTopologyComponentData();

  const handleShowDetails = useCallback(
    (data: GraphNode | null) => {
      const id = data?.id;

      if (id) {
        navigate(`${ComponentRoutesPaths.Components}/${data?.name}@${id}`);
      }
    },
    [navigate]
  );

  const { nodeIdSelected, nodes, edges, nodeIdsToHighLight } = TopologyComponentController.dataTransformer({
    idsSelected,
    searchText,
    components,
    componentsPairs
  });

  return (
    <Stack>
      <StackItem>
        <TopologyToolbar
          resourcePlaceholder={TopologyLabels.DisplayComponentsDefaultLabel}
          onResourceSelected={handleSearchText}
        />
        <Divider />
      </StackItem>

      <StackItem isFilled>
        <GraphComponent
          nodes={nodes}
          edges={edges}
          itemSelected={nodeIdSelected}
          itemsToHighlight={nodeIdsToHighLight}
          onClickNode={handleShowDetails}
        />
      </StackItem>
    </Stack>
  );
};

export default TopologyComponent;
