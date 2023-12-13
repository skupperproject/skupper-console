import { INode, NodeConfig } from '@antv/g6';

import { NODE_COUNT_PERFORMANCE_THRESHOLD, TopologyModeNames } from '../Graph.constants';
import {
  GraphCombo,
  GraphEdge,
  GraphNode,
  LocalStorageData,
  LocalStorageDataSaved,
  LocalStorageDataSavedPayload
} from '../Graph.interfaces';

const prefixLocalStorageItem = 'skupper';

export const GraphController = {
  saveAllNodePositions: (nodes: LocalStorageData[]) => {
    const savedNodePositionsMap = JSON.parse(
      localStorage.getItem(prefixLocalStorageItem) || '{}'
    ) as LocalStorageDataSaved;

    const nodePositionsMap = nodes.reduce((acc, { id, x, y }) => {
      acc[id] = { x, y };

      return acc;
    }, {} as LocalStorageDataSaved);

    const result = { ...savedNodePositionsMap };

    for (const key in nodePositionsMap) {
      if (key in result) {
        delete result[key];
      }
    }

    Promise.resolve(localStorage.setItem(prefixLocalStorageItem, JSON.stringify({ ...result, ...nodePositionsMap })));
  },

  removeAllNodePositionsFromLocalStorage() {
    localStorage.removeItem(prefixLocalStorageItem);
  },

  cleanControlsFromLocalStorage(suffix: string) {
    Object.keys(localStorage)
      .filter((x) => x.endsWith(suffix))
      .forEach((x) => localStorage.removeItem(x));
  },

  // TODO: remove this function when Backend sanitize the old process pairs
  sanitizeEdges: (nodes: GraphNode[], edges: GraphEdge[]) => {
    const availableNodesMap = nodes.reduce(
      (acc, node) => {
        acc[node.id] = node.id;

        return acc;
      },
      {} as Record<string, string>
    );

    return edges.filter(({ source, target }) => availableNodesMap[source] && availableNodesMap[target]);
  },

  fromNodesToLocalStorageData(nodes: INode[], setLocalStorageData: Function) {
    return nodes
      .map((node) => {
        const { id, x, y, persistPositionKey } = node.getModel() as NodeConfig;

        if (id && x !== undefined && y !== undefined) {
          return setLocalStorageData({ id: persistPositionKey || id, x, y });
        }

        return undefined;
      })
      .filter(Boolean) as LocalStorageData[];
  },

  addPositionsToNodes(nodesWithoutPosition: GraphNode[], nodesWithPositions: INode[] = []) {
    const cache = JSON.parse(localStorage.getItem(prefixLocalStorageItem) || '{}');

    const nodesWithCachedPosition = nodesWithoutPosition.map((node) => {
      const positions = cache[node.persistPositionKey || node.id] as LocalStorageDataSavedPayload | undefined;

      const x = positions ? positions.x : undefined;
      const y = positions ? positions.y : undefined;

      return { ...node, x, y };
    });

    //Map of the most updated nodes from the graph
    const positionMap = nodesWithPositions?.reduce(
      (acc, node) => {
        const id = (node.getModel().persistPositionKey || node.getID()) as string;
        acc[id] = { x: node.getModel().x, y: node.getModel().y };

        return acc;
      },
      {} as Record<string, { x?: number; y?: number }>
    );

    // check updated nodes from the graph otherwise rollback to the localstorage position
    const nodes = nodesWithCachedPosition.map((node) => ({
      ...node,
      x: positionMap[node.persistPositionKey || node.id]?.x || node.x,
      y: positionMap[node.persistPositionKey || node.id]?.y || node.y
    }));

    return nodes;
  },

  isPerformanceThresholdExceeded: (nodesCount: number) => nodesCount >= NODE_COUNT_PERFORMANCE_THRESHOLD,

  getModeBasedOnPerformanceThreshold(nodeCount: number) {
    return GraphController.isPerformanceThresholdExceeded(nodeCount)
      ? TopologyModeNames.Performance
      : TopologyModeNames.Default;
  },

  cleanAllLocalNodePositions(nodes: INode[], shouldRemoveFixedPosition: boolean = false) {
    nodes.forEach((node) => {
      const nodeModel = node.getModel();
      nodeModel.x = undefined;
      nodeModel.y = undefined;

      if (shouldRemoveFixedPosition) {
        nodeModel.fx = undefined;
        nodeModel.fy = undefined;
      }
    });
  },

  getG6Model: ({ nodes, edges, combos }: { nodes: GraphNode[]; edges: GraphEdge[]; combos?: GraphCombo[] }) => ({
    nodes: JSON.parse(
      JSON.stringify(
        nodes.map((node) => ({
          ...node,
          cluster: node.comboId, // activate the cluster mode for processes inside a site
          fx: node.x, // fix position saved in the local storage
          fy: node.y
        }))
      )
    ),
    edges: JSON.parse(JSON.stringify(GraphController.sanitizeEdges(nodes, edges))),
    combos: combos ? JSON.parse(JSON.stringify(combos)) : undefined
  }),

  calculateMaxIteration: (nodeCount: number) => {
    if (nodeCount >= 400) {
      return 100;
    }

    if (nodeCount > 100) {
      return 500;
    }

    return 1000;
  }
};
