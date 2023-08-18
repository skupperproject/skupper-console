import { INode, NodeConfig } from '@antv/g6';

import {
  DEFAULT_LAYOUT_COMBO_FORCE_CONFIG,
  DEFAULT_LAYOUT_FORCE_CONFIG,
  DEFAULT_LAYOUT_FORCE_WITH_GPU_CONFIG
} from './config';
import {
  GraphCombo,
  GraphEdge,
  GraphNode,
  LocalStorageData,
  LocalStorageDataSaved,
  LocalStorageDataSavedPayload,
  LocalStorageDataWithNullXY
} from './Graph.interfaces';

const prefixLocalStorageItem = 'skupper';

export const GraphController = {
  saveDataInLocalStorage: (topologyNodes: LocalStorageData[]) => {
    const cache = JSON.parse(localStorage.getItem(prefixLocalStorageItem) || '{}');

    const topologyMap = topologyNodes.reduce((acc, { id, x, y }) => {
      if (id) {
        acc[id] = { x, y };
      }

      return acc;
    }, {} as LocalStorageDataSaved);

    localStorage.setItem(prefixLocalStorageItem, JSON.stringify({ ...cache, ...topologyMap }));
  },

  getPositionFromLocalStorage(id: string): LocalStorageDataWithNullXY {
    const cache = JSON.parse(localStorage.getItem(prefixLocalStorageItem) || '{}');
    const positions = cache[id] as LocalStorageDataSavedPayload | undefined;

    const x = positions ? positions.x : undefined;
    const y = positions ? positions.y : undefined;

    return { id, x, y };
  },

  cleanPositionsFromLocalStorage() {
    localStorage.removeItem(prefixLocalStorageItem);
  },

  cleanPositionsControlsFromLocalStorage(suffix: string) {
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
        const { id, x, y } = node.getModel() as NodeConfig;

        if (id && x !== undefined && y !== undefined) {
          return setLocalStorageData({ id, x, y });
        }

        return undefined;
      })
      .filter(Boolean) as LocalStorageData[];
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

  selectLayoutFromNodes: (nodes: GraphNode[], hasCombo: boolean = false) => {
    let layout = undefined;
    const nodeCount = !!nodes.filter((node) => node.x === undefined && node.y === undefined).length;

    if (nodeCount) {
      if (hasCombo) {
        layout = DEFAULT_LAYOUT_COMBO_FORCE_CONFIG;
      } else {
        layout = nodes.length <= 200 ? DEFAULT_LAYOUT_FORCE_CONFIG : DEFAULT_LAYOUT_FORCE_WITH_GPU_CONFIG;
      }
    }

    return layout;
  },

  calculateMaxIteration(nodeCount: number) {
    if (nodeCount > 900) {
      return 10;
    }

    if (nodeCount > 750) {
      return 10;
    }

    if (nodeCount > 600) {
      return 15;
    }

    if (nodeCount > 450) {
      return 20;
    }

    if (nodeCount > 300) {
      return 50;
    }

    if (nodeCount > 150) {
      return 75;
    }

    return 100;
  }
};
