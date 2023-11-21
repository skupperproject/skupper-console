import { INode, NodeConfig } from '@antv/g6';

import {
  GraphCombo,
  GraphEdge,
  GraphNode,
  LocalStorageData,
  LocalStorageDataSaved,
  LocalStorageDataSavedPayload,
  LocalStorageDataWithNullXY
} from '../Graph.interfaces';

const prefixLocalStorageItem = 'skupper';

export const GraphController = {
  saveAllNodePositions: (topologyNodes: LocalStorageData[]) => {
    const nodePositions = JSON.parse(localStorage.getItem(prefixLocalStorageItem) || '{}');
    const topologyMap = topologyNodes.reduce((acc, { id, x, y }) => {
      acc[id] = { x, y };

      return acc;
    }, {} as LocalStorageDataSaved);

    let result = { ...nodePositions };

    for (const key in topologyNodes) {
      if (Object.prototype.hasOwnProperty.call(topologyNodes, key)) {
        result = Object.fromEntries(Object.entries(result).filter(([k]) => k !== key));
      }
    }

    localStorage.setItem(prefixLocalStorageItem, JSON.stringify({ ...result, ...topologyMap }));
  },

  getNodePosition(id: string): LocalStorageDataWithNullXY {
    const cache = JSON.parse(localStorage.getItem(prefixLocalStorageItem) || '{}');

    const positions = cache[id] as LocalStorageDataSavedPayload | undefined;

    const x = positions ? positions.x : undefined;
    const y = positions ? positions.y : undefined;

    return { id, x, y };
  },

  removeAllNodePositions() {
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

  addPositionsToNodes(nodes: GraphNode[]) {
    return nodes.map((node) => {
      const { x, y } = GraphController.getNodePosition(node.persistPositionKey || node.id);

      return { ...node, x, y };
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
  })
};
