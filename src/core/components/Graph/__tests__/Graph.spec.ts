import Graph, { mapGraphEdges } from '../Graph';
import { GraphEdge, GraphNode } from '../Graph.interfaces';

describe('Graph', () => {
  const nodes: GraphNode[] = [
    { id: '1', name: 'Node 1', x: 0, y: 0, color: 'red', group: 'group1', groupName: 'Group 1' },
    { id: '2', name: 'Node 2', x: 10, y: 10, color: 'blue', group: 'group1', groupName: 'Group 1' },
    { id: '3', name: 'Node 3', x: 20, y: 20, color: 'green', group: 'group2', groupName: 'Group 2' }
  ];

  const edges: GraphEdge<string>[] = [
    { source: '1', target: '2' },
    { source: '2', target: '3' }
  ];

  const $node = document.createElement('div');
  const width = 800;
  const height = 600;

  let graph: Graph;

  beforeEach(() => {
    graph = new Graph({ $node, width, height });
  });

  it('should create a Graph instance with correct initial state', () => {
    expect(graph.nodes).toEqual([]);
    expect(graph.links).toEqual([]);
    expect(graph.width).toEqual(width);
    expect(graph.height).toEqual(height);
    expect(graph.force).toBeDefined();
    expect(graph.svgGraph).toBeDefined();
    expect(graph.svgGraphGroup).toBeDefined();
    expect(graph.isDraggingNode).toBeFalsy();
    expect(graph.zoom).toBeDefined();
    expect(graph.groups).toBeUndefined();
    expect(graph.nodeInitialized).toBeUndefined();
    expect(graph.EventEmitter).toBeDefined();
  });

  it('updates node data before run should give me empty nodes and edges', () => {
    graph.updateModel({ nodes, edges });

    expect(graph.nodes).toEqual([]);
    expect(graph.links).toEqual([]);
  });

  it('updates existing node positions', () => {
    graph.run({ nodes, edges });
    const updatedNodes: GraphNode[] = [
      { id: '1', name: 'Node 1', x: 5, y: 5, color: 'red', group: 'group1', groupName: 'Group 1' },
      { id: '2', name: 'Node 2', x: 15, y: 15, color: 'blue', group: 'group1', groupName: 'Group 1' },
      { id: '3', name: 'Node 3', x: 25, y: 25, color: 'green', group: 'group2', groupName: 'Group 2' }
    ];

    const updatedNodesAfterForceSimulation: GraphNode[] = [
      { ...updatedNodes[0], fx: 5, fy: 5, vx: 0, vy: 0, index: 0 },
      { ...updatedNodes[1], fx: 15, fy: 15, vx: 0, vy: 0, index: 1 },
      { ...updatedNodes[2], fx: 25, fy: 25, vx: 0, vy: 0, index: 2 }
    ];

    graph.updateModel({ nodes: updatedNodes, edges });

    expect(graph.nodes).toEqual(updatedNodesAfterForceSimulation);
    expect(graph.links).toEqual(mapGraphEdges(edges, updatedNodesAfterForceSimulation));
  });
});
