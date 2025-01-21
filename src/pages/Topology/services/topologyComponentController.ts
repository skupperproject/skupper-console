import { GraphNode } from 'types/Graph.interfaces';

import { Role } from '../../../API/REST.enum';
import { PairsResponse, ComponentResponse } from '../../../types/REST.interfaces';
import { shape } from '../Topology.constants';

import { TopologyController } from '.';

interface TopologyComponentControllerProps {
  idsSelected: string[] | undefined;
  searchText: string;
  components: ComponentResponse[];
  componentsPairs: PairsResponse[];
}

export const convertComponentToNode = ({ identity, name, role: role, processCount }: ComponentResponse): GraphNode => ({
  id: identity,
  name,
  label: name,
  iconName: role === Role.Internal ? 'skupper' : 'component',
  type: role === Role.Remote ? shape.remote : shape.bound,
  info: { primary: processCount.toString() }
});

const convertComponentsToNodes = (entities: ComponentResponse[]): GraphNode[] => entities.map(convertComponentToNode);

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
