import { ComponentPairsResponse, ComponentResponse } from '@API/REST.interfaces';
import componentIcon from '@assets/component.svg';
import skupperIcon from '@assets/skupper.svg';
import { GraphNode } from '@core/components/Graph/Graph.interfaces';

import { shape } from '../Topology.constants';

import { TopologyController, convertEntityToNode } from '.';

interface TopologyComponentControllerProps {
  idsSelected: string[] | undefined;
  searchText: string;
  components: ComponentResponse[];
  componentsPairs: ComponentPairsResponse[];
}

const convertComponentsToNodes = (entities: ComponentResponse[]): GraphNode[] =>
  entities.map(({ identity, name, processGroupRole: role, processCount }) => {
    const iconSrc = role === 'internal' ? skupperIcon : componentIcon;

    const type = role === 'remote' ? shape.remote : shape.bound;

    return convertEntityToNode({
      id: identity,
      label: name,
      iconSrc,
      type,
      groupedNodeCount: processCount
    });
  });

export const TopologyComponentController = {
  dataTransformer: ({ idsSelected, components, componentsPairs, searchText }: TopologyComponentControllerProps) => {
    const nodes = convertComponentsToNodes(components);

    return {
      nodeIdSelected: TopologyController.transformIdsToStringIds(idsSelected),
      nodeIdsToHighLight: TopologyController.nodesToHighlight(nodes, searchText),
      nodes,
      edges: TopologyController.convertPairsToEdges(componentsPairs)
    };
  }
};
