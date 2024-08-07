import { Role } from '@API/REST.enum';
import { ComponentPairsResponse, ComponentResponse } from '@API/REST.interfaces';
import { GraphNode } from '@core/components/SkGraph/Graph.interfaces';

import { shape } from '../Topology.constants';

import { TopologyController } from '.';

interface TopologyComponentControllerProps {
  idsSelected: string[] | undefined;
  searchText: string;
  components: ComponentResponse[];
  componentsPairs: ComponentPairsResponse[];
}

const convertComponentsToNodes = (entities: ComponentResponse[]): GraphNode[] =>
  entities.map(({ identity, name, processGroupRole: role, processCount }) => ({
    id: identity,
    label: name,
    iconName: role === Role.Internal ? 'skupper' : 'component',
    type: role === Role.Remote ? shape.remote : shape.bound,
    groupedNodeCount: processCount
  }));

export const TopologyComponentController = {
  dataTransformer: ({ idsSelected, components, componentsPairs, searchText }: TopologyComponentControllerProps) => {
    const nodes = convertComponentsToNodes(components);

    return {
      nodeIdSelected: TopologyController.transformIdsToStringIds(idsSelected),
      nodeIdsToHighLight: TopologyController.nodesToHighlight(nodes, searchText),
      nodes,
      edges: TopologyController.convertPairsToEdges(componentsPairs, 'SkDataEdge')
    };
  }
};
