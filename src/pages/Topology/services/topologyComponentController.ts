import { ComponentPairsResponse, ComponentResponse } from '@API/REST.interfaces';

import { TopologyController } from '.';

interface TopologyComponentControllerProps {
  components: ComponentResponse[];
  componentsPairs: ComponentPairsResponse[];
}

export const TopologyComponentController = {
  dataTransformer: ({ components, componentsPairs }: TopologyComponentControllerProps) => ({
    nodes: TopologyController.convertProcessGroupsToNodes(components),
    edges: TopologyController.convertPairsToEdges(componentsPairs)
  })
};
