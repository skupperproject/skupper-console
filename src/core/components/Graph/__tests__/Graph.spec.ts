import Graph from '../Graph';
import { GraphEdge, GraphNode, GraphNodeWithForce } from '../Graph.interfaces';
import { GraphController } from '../services';

describe('Graph', () => {
  const nodes: GraphNode[] = [
    { id: '1', label: 'Node 1', x: 0, y: 0, style: { fill: 'red' }, group: 'group1' },
    { id: '2', label: 'Node 2', x: 10, y: 10, style: { fill: 'blue' }, group: 'group1' },
    { id: '3', label: 'Node 3', x: 20, y: 20, style: { fill: 'green' }, group: 'group2' }
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
      { id: '1', label: 'Node 1', x: 5, y: 5, style: { fill: 'red' }, group: 'group1' },
      { id: '2', label: 'Node 2', x: 15, y: 15, style: { fill: 'blue' }, group: 'group1' },
      { id: '3', label: 'Node 3', x: 25, y: 25, style: { fill: 'green' }, group: 'group2' }
    ];

    const updatedNodesAfterForceSimulation: GraphNodeWithForce[] = [
      { ...updatedNodes[0], x: 5, y: 5, fx: 5, fy: 5, vx: 0, vy: 0, index: 0 },
      { ...updatedNodes[1], x: 15, y: 15, fx: 15, fy: 15, vx: 0, vy: 0, index: 1 },
      { ...updatedNodes[2], x: 25, y: 25, fx: 25, fy: 25, vx: 0, vy: 0, index: 2 }
    ];

    graph.updateModel({ nodes: updatedNodes, edges });

    expect(graph.nodes).toEqual(updatedNodesAfterForceSimulation);
    expect(graph.links).toEqual(GraphController.mapGraphEdges(edges, updatedNodesAfterForceSimulation));
  });
});
