import { easeLinear } from 'd3-ease';
import { interpolate } from 'd3-interpolate';
import { polygonHull } from 'd3-polygon';
import { Selection, select } from 'd3-selection';

import { DEFAULT_COLOR, ARROW_SIZE, NODE_SIZE, SELECTED_EDGE_COLOR } from './config';
import { GraphEdge, GraphNode, GraphNodeWithForce } from './Graph.interfaces';

export const GraphController = {
  animateEdges: ({ source, target }: { source: { id: string }; target: { id: string } }) => {
    (select<SVGSVGElement, GraphEdge>(`#edge${source.id}-${target.id}`) as any)
      .style('stroke-dasharray', '8, 8')
      .style('stroke', SELECTED_EDGE_COLOR)
      .transition()
      .duration(1000)
      .ease(easeLinear)
      .styleTween('stroke-dashoffset', () => interpolate('30', '0'))
      .on('end', GraphController.animateEdges);
  },

  stopAnimateEdges: ({ source, target }: GraphEdge) => {
    (select(`#edge${source.id}-${target.id}`) as any)
      .style('stroke-dasharray', '0, 0')
      .style('stroke', DEFAULT_COLOR)
      .transition()
      .on('end', null);
  },

  selectNodeTextStyle: (id: string) => {
    select(`#node-cover-${id}`).attr('fill', 'white');
  },

  deselectNodeTextStyle: (id: string) => {
    select(`#node-cover-${id}`).attr('fill', 'transparent');
  },

  addEdgeArrows: (container: Selection<SVGGElement, GraphNodeWithForce, null, undefined>) =>
    container
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', NODE_SIZE / 2 + ARROW_SIZE)
      .attr('refY', 0)
      .attr('markerWidth', ARROW_SIZE)
      .attr('markerHeight', ARROW_SIZE)
      .attr('orient', 'auto-start-reverse')
      .append('svg:path')
      .style('fill', 'gray')
      .attr('d', 'M0,-5L10,0L0,5'),

  isEdgeBetweenNodes: (svgLink: { source: { id: string }; target: { id: string } }, id: string | undefined) => {
    if (!id) {
      return false;
    }

    const nodeIds = id.split('-to-');

    return (
      (nodeIds.length === 2 && svgLink.source.id === nodeIds[0] && svgLink.target.id === nodeIds[1]) ||
      id === svgLink.source.id ||
      id === svgLink.target.id
    );
  },

  /**
   * Generates a polygon hull from a group of nodes in a graph.
   */
  polygonGenerator: (nodes: GraphNodeWithForce[], groupId: string): [number, number][] | null => {
    // Validate input parameters
    if (!groupId || !Array.isArray(nodes)) {
      return null;
    }

    // Filter nodes by group ID and get their coordinates
    const nodeCoords: [number, number][] = nodes.filter(({ group }) => group === groupId).map(({ x, y }) => [x, y]);

    const [x, y] = nodeCoords[0] || [0, 0];

    // Ensure there are at least three nodes to create a polygon
    if (nodeCoords.length === 2) {
      for (let i = nodeCoords.length; i < 3; i++) {
        nodeCoords.push([x + NODE_SIZE * i, y + NODE_SIZE * i]);
      }
    }

    // Ensure there are at least three nodes to create a polygon
    if (nodeCoords.length < 2) {
      nodeCoords.push([x + NODE_SIZE * 2, y]);
      nodeCoords.push([x - NODE_SIZE * 2, y]);
      nodeCoords.push([x, y - NODE_SIZE * 2]);
      nodeCoords.push([x, y + NODE_SIZE * 2]);
    }

    // Generate the polygon hull from the node coordinates
    const polygon = polygonHull(nodeCoords);

    // Return the polygon hull, or null if it couldn't be generated
    return polygon || null;
  },

  /**
   * Convert a GraphEdge object with string source and target properties to a GraphEdge object
   * with GraphNode source and target properties.
   */
  mapGraphEdges: (edges: GraphEdge<string>[], nodes: GraphNode[]): GraphEdge[] =>
    edges.map((edge, index) => ({
      index,
      source: nodes.find((node) => node.id === edge.source) as GraphNodeWithForce,
      target: nodes.find((node) => node.id === edge.target) as GraphNodeWithForce
    }))
};
