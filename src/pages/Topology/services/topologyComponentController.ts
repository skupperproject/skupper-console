import { ComponentPairsResponse, ComponentResponse } from '@API/REST.interfaces';
import componentIcon from '@assets/component.svg';
import skupperIcon from '@assets/skupper.svg';
import { DEFAULT_REMOTE_NODE_CONFIG } from '@core/components/Graph/Graph.constants';
import { GraphNode } from '@core/components/Graph/Graph.interfaces';

import { shape } from '../Topology.constants';

import { TopologyController, convertEntityToNode } from '.';

interface TopologyComponentControllerProps {
  idSelected: string[] | undefined;
  components: ComponentResponse[];
  componentsPairs: ComponentPairsResponse[];
}

const convertProcessGroupsToNodes = (entities: ComponentResponse[]): GraphNode[] =>
  entities.map(({ identity, name, processGroupRole, processCount }) => {
    const img = processGroupRole === 'internal' ? skupperIcon : componentIcon;

    const nodeConfig =
      processGroupRole === 'remote'
        ? DEFAULT_REMOTE_NODE_CONFIG
        : { type: shape.bound, notificationValue: processCount, enableBadge1: true };

    return convertEntityToNode({ id: identity, label: name, iconFileName: img, nodeConfig });
  });

export const TopologyComponentController = {
  dataTransformer: ({ idSelected, components, componentsPairs }: TopologyComponentControllerProps) => ({
    nodeIdSelected: TopologyController.transformIdsToStringIds(idSelected),
    nodes: convertProcessGroupsToNodes(components),
    edges: TopologyController.convertPairsToEdges(componentsPairs)
  })
};
