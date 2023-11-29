import { INode, NodeConfig } from '@antv/g6';

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
    const cache = JSON.parse(localStorage.getItem(prefixLocalStorageItem) || '{}');

    return nodes.map((node) => {
      const positions = cache[node.persistPositionKey || node.id] as LocalStorageDataSavedPayload | undefined;

      const x = positions ? positions.x : undefined;
      const y = positions ? positions.y : undefined;

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
  }),
  calculateMaxIteration: (nodes: GraphNode[]) => {
    const nodesLength = nodes.length;

    if (nodesLength > 800) {
      return 200;
    }

    if (nodesLength > 500) {
      return 700;
    }

    return 1000;
  }
};
