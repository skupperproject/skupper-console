import { GraphCombo, GraphEdge, GraphNode, LocalStorageData } from './Graph.interfaces';

export const GraphController = {
  saveDataInLocalStorage: (topologyNodes: Partial<LocalStorageData>[]) => {
    topologyNodes.forEach(({ id, x, y }) => {
      if (id && x && y) {
        //save the position of the node to the local storage
        localStorage.setItem(id, JSON.stringify({ x, y }));
      }
    });
  },

  getPositionFromLocalStorage(identity: string): LocalStorageData {
    const positions = localStorage.getItem(identity);

    const x = positions ? JSON.parse(positions).x : null;
    const y = positions ? JSON.parse(positions).y : null;

    return { id: identity, x, y };
  },
  // TODO: remove this function when Backend sanitize the old process pairs
  sanitizeEdges: (nodes: GraphNode[], edges: GraphEdge[]) => {
    const availableNodesMap = nodes.reduce((acc, node) => {
      acc[node.id] = node.id;

      return acc;
    }, {} as Record<string, string>);

    return edges.filter(({ source, target }) => availableNodesMap[source] && availableNodesMap[target]);
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
