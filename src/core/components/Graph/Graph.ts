import { drag } from 'd3-drag';
import { easeLinear } from 'd3-ease';
import {
  forceSimulation,
  forceCenter,
  forceLink,
  forceX,
  forceY,
  Simulation,
  ForceLink,
  forceCollide,
  forceManyBody
} from 'd3-force';
import { interpolate } from 'd3-interpolate';
import { polygonCentroid, polygonHull } from 'd3-polygon';
import { scaleOrdinal } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { line, curveCardinalClosed } from 'd3-shape';
import { zoom, zoomIdentity, ZoomBehavior, zoomTransform } from 'd3-zoom';

import EventEmitter from '@core/components/Graph/EventEmitter';
import { deepCloneArray } from '@core/utils/deepCloneArray';

import {
  ARROW_SIZE,
  DEFAULT_COLOR,
  EDGE_CLASS_NAME,
  FONT_SIZE_DEFAULT,
  GROUP_NODE_PATHS_CLASS_NAME,
  ITERATIONS,
  NODE_CLASS_NAME,
  NODE_SIZE,
  OPACITY_NO_SELECTED_ITEM,
  SELECTED_EDGE_COLOR,
  SELECTED_TEXT_COLOR,
  ZOOM_TEXT
} from './config';
import { nodeColorsDefault } from './Graph.constants';
import { GraphEvents } from './Graph.enum';
import { GraphNode, GraphEdge, GraphProps, GraphGroup } from './Graph.interfaces';

export default class Graph {
  $root: HTMLElement;
  nodes: GraphNode[];
  links: GraphEdge[];
  width: number;
  height: number;
  force: Simulation<GraphNode, GraphEdge>;
  svgGraph: Selection<SVGSVGElement, GraphNode, null, undefined>;
  svgGraphGroup: Selection<SVGGElement, GraphNode, null, undefined>;
  isDraggingNode: boolean;
  zoom: ZoomBehavior<SVGSVGElement, GraphNode>;
  groups?: GraphGroup[];
  nodeInitialized?: string;
  EventEmitter: EventEmitter;

  constructor({ $node, width, height, nodeSelected }: GraphProps) {
    this.$root = $node;
    this.nodeInitialized = nodeSelected;
    this.width = width;
    this.height = height;
    this.isDraggingNode = false;

    this.groups;
    this.nodes = [];
    this.links = [];

    this.EventEmitter = new EventEmitter();
    this.force = this.configureForceSimulation();

    this.zoom = zoom<SVGSVGElement, GraphNode>().scaleExtent([0.2, 5]);
    this.zoom.on('zoom', ({ transform }) => {
      this.svgGraphGroup.attr('transform', transform);
    });

    this.svgGraph = this.createGraphContainer();
    this.svgGraphGroup = this.createGraphGroup();

    // It enables the movement/zoom of the graph with the track pad
    this.svgGraph.call(this.zoom);
  }

  private configureForceSimulation() {
    // create two scales for x and y axes
    const xScale = scaleOrdinal<string, number>();
    const yScale = scaleOrdinal<string, number>();

    // define a function to calculate the x-coordinate of a node
    const getNodeX = ({ group, fx }: GraphNode) => {
      const domain = this.groups || this.nodes;
      // map each id to a corresponding x-coordinate and set it as the domain for the x-scale
      xScale.domain(domain.map(({ id }) => id)).range(domain.map((_, i) => (this.width / domain.length) * i));

      // if the node has a pre-set x-coordinate, use that, otherwise calculate the position based on its group
      return fx || Math.min(xScale(group) as number, this.width - NODE_SIZE);
    };

    // define a function to calculate the y-coordinate of a node
    const getNodeY = ({ group, fy }: GraphNode) => {
      const domain = this.groups || this.nodes;
      // set the range of the y-scale to be within the bounds of the graph
      yScale.domain(domain.map(({ id }) => id)).range([NODE_SIZE, this.height - NODE_SIZE * 2]);

      // if the node has a pre-set y-coordinate, use that, otherwise calculate the position based on its group
      return fy || Math.min(yScale(group) as number, this.height - NODE_SIZE * 2);
    };

    const linkForce = forceLink<GraphNode, GraphEdge>()
      .distance(25)
      .id(({ id }) => id);

    return forceSimulation<GraphNode, GraphEdge>()
      .force('center', forceCenter(this.width / 2, this.height / 2))
      .force('charge', forceManyBody())
      .force('collide', forceCollide().radius(NODE_SIZE * 2))
      .force('x', forceX<GraphNode>().x(getNodeX).strength(0.8))
      .force('y', forceY<GraphNode>().y(getNodeY).strength(0.8))
      .force('link', linkForce)
      .stop(); // stop the simulation (since we only want to run it once to set the initial positions)
  }

  private createGraphContainer() {
    return select<HTMLElement, GraphNode>(this.$root)
      .append('svg')
      .attr('class', 'graph-container')
      .attr('width', '100%')
      .attr('height', '100%');
  }

  private createGraphGroup() {
    return this.svgGraph.append('g').attr('class', 'graph-draw-container').attr('width', '100%').attr('height', '100%');
  }

  private getAllNodes() {
    return this.svgGraphGroup.selectAll<SVGSVGElement, GraphNode>(`.${NODE_CLASS_NAME}`);
  }

  private getAllEdges() {
    return this.svgGraphGroup.selectAll<SVGSVGElement, GraphEdge>(`.${EDGE_CLASS_NAME}`);
  }

  private getAllEdgesPaths() {
    return this.svgGraphGroup.selectAll<SVGSVGElement, GraphEdge>(`.${EDGE_CLASS_NAME}_path`);
  }

  private getAllEdgesLabels() {
    return this.svgGraphGroup.selectAll<SVGSVGElement, GraphEdge>(`.${EDGE_CLASS_NAME}_label`);
  }

  private dragStarted = (_: {}, node: GraphNode) => {
    this.isDraggingNode = true;

    node.fx = node.x;
    node.fy = node.y;

    this.force.tick(1);
    this.redrawPositions();
  };

  private dragged = ({ x, y }: { x: number; y: number }, node: GraphNode) => {
    node.fx = x;
    node.fy = y;

    this.force.tick(1);
    this.redrawPositions();
  };

  private dragEnded = (_: {}, node: GraphNode) => {
    this.isDraggingNode = false;
    this.EventEmitter.emit(GraphEvents.IsDraggingNodeEnd, [node]);
  };

  private groupDragStarted = ({ x, y }: { x: number; y: number; active: boolean }, { id: groupId }: GraphGroup) => {
    this.isDraggingNode = true;

    this.nodes
      .filter(({ group }) => group === groupId)
      .forEach((node) => {
        node.groupFx = x;
        node.groupFy = y;
      });

    this.force.tick(1);
    this.redrawPositions();
  };

  private groupDragged = ({ x, y }: { x: number; y: number }, { id: groupId }: GraphGroup) => {
    this.nodes
      .filter(({ group }) => group === groupId)
      .forEach((node) => {
        node.fx = node.x + x - (node.groupFx || 0);
        node.fy = node.y + y - (node.groupFy || 0);
      });

    this.force.tick(1);
    this.redrawPositions();
  };

  private groupDragEnded = (_: {}, { id: groupId }: GraphGroup) => {
    this.isDraggingNode = false;
    this.EventEmitter.emit(GraphEvents.IsDraggingNodesEnd, [this.nodes.filter(({ group }) => group === groupId)]);
  };

  private redrawPositions = () => {
    // move nodes
    this.getAllNodes().attr('transform', ({ x, y }) => `translate(${x},${y})`);

    // move edges
    this.getAllEdges()
      .attr('x1', ({ source }) => source.x)
      .attr('y1', ({ source }) => source.y)
      .attr('x2', ({ target }) => target.x)
      .attr('y2', ({ target }) => target.y);

    this.getAllEdgesPaths().attr('d', ({ source, target }) => {
      let startX = source.x;
      let startY = source.y;
      let endX = target.x;
      let endY = target.y;

      if (target.x < source.x) {
        startX = target.x;
        endX = source.x;
        startY = target.y;
        endY = source.y;
      }

      return `M ${startX} ${startY} L ${endX} ${endY}`;
    });

    // move groups
    if (this.groups) {
      this.groups.forEach(({ id: groupId }) => {
        let centroid: [number, number] = [0, 0];
        const paths = this.svgGraphGroup
          .selectAll<SVGPathElement, GraphGroup>(`.${GROUP_NODE_PATHS_CLASS_NAME}`)
          .filter(({ id }) => id === groupId)
          .attr('transform', 'scale(1) translate(0,0)')
          .attr('d', ({ id }) => {
            const polygon = polygonGenerator(this.nodes, id);
            centroid = polygon ? polygonCentroid(polygon) : [0, 0];

            const points: [number, number][] = (polygon || [])?.map(function (point) {
              return [point[0] - centroid[0] || 0, point[1] - centroid[1] || 0];
            });

            const createCurve = line()
              .x(function (d) {
                return d[0];
              })
              .y(function (d) {
                return d[1];
              })
              .curve(curveCardinalClosed);

            return createCurve(points);
          });

        const $parentNode = paths.filter(({ id }) => id === groupId).node()?.parentNode as HTMLElement | null;

        select($parentNode).attr('transform', `translate(${centroid[0]},${centroid[1]}) scale(${1.5})`); // scale works as a padding around the nodes
      });
    }
  };

  private redrawEdges = () => {
    addEdgeArrows(this.svgGraphGroup);

    const links = this.links as GraphEdge[];

    // Use selection.join() instead of enter() to simplify code
    this.getAllEdges()
      .data(links)
      .join('line')
      .style('stroke-width', '1px')
      .attr('id', ({ source, target }) => `edge${source.id}-${target.id}`)
      .attr('class', EDGE_CLASS_NAME)
      .attr('marker-end', 'url(#arrow)');

    this.getAllEdgesPaths()
      .data(links)
      .join('path')
      .attr('class', `${EDGE_CLASS_NAME}_path`)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .attr('id', ({ source, target }) => `edge-path${source.id}-${target.id}`)
      .style('pointer-events', 'visibleStroke')
      .attr('stroke-width', '30px')
      .style('cursor', (data) => (data.clickable ? 'pointer' : 'default'))
      .on('mouseover', (_, { source, target }) => {
        this.nodeInitialized = `${source.id}-to-${target.id}`;
        this.reStyleEdges();
      })
      .on('mouseout', () => {
        this.nodeInitialized = undefined;
        this.reStyleEdges();
      })
      .on('click', (_, nodeSelected) => {
        this.EventEmitter.emit(GraphEvents.EdgeClick, [
          {
            type: 'click',
            name: GraphEvents.EdgeClick,
            data: { ...nodeSelected }
          }
        ]);
      });

    this.getAllEdgesLabels()
      .data(links)
      .join('text')
      .style('pointer-events', 'none')
      .attr('class', `${EDGE_CLASS_NAME}_label`)
      .attr('id', ({ source, target }) => `edge-label${source.id}-${target.id}`)
      .attr('font-size', FONT_SIZE_DEFAULT)
      .style('transform', 'translate(0px,-5px)')
      .selectAll('textPath')
      .data((d) => [d])
      .join('textPath')
      .attr('xlink:href', ({ source, target }) => `#edge-path${source.id}-${target.id}`)
      .style('text-anchor', 'middle')
      .style('fill', SELECTED_TEXT_COLOR)
      .attr('startOffset', '50%')
      .text(() => '');

    this.reStyleEdges();
  };

  private reStyleEdges() {
    const nodeId = this.nodeInitialized;

    this.getAllEdges()
      .each((svgLink) => {
        if (!isEdgeBetweenNodes(svgLink, nodeId)) {
          stopAnimateEdges(svgLink);
        }

        if (isEdgeBetweenNodes(svgLink, nodeId)) {
          animateEdges(svgLink);
        }
      })
      .style('stroke-dasharray', ({ type, source, target }) =>
        type === 'dashed' || isEdgeBetweenNodes({ source, target }, nodeId) ? '8,8' : '0,0'
      );
  }

  // Redraw the group nodes in the graph based on the current group IDs
  private redrawGroups = () => {
    if (this.groups) {
      // Select all existing group nodes and bind them to the data
      const groupNodes = this.svgGraphGroup
        .selectAll<SVGGElement, GraphGroup>('.group_node') // Specify element and data type
        .data(this.groups);

      // Create new group nodes for any data points that don't yet have a corresponding element
      const groupNodesEnter = groupNodes.enter().append('g').attr('class', 'group_node');

      // Create path elements for each new group node and set up drag and click events
      groupNodesEnter
        .append('path')
        .attr('class', GROUP_NODE_PATHS_CLASS_NAME)
        .attr('opacity', OPACITY_NO_SELECTED_ITEM)
        .style('cursor', 'grab')
        .call(
          drag<SVGPathElement, GraphGroup>()
            .on('start', this.groupDragStarted)
            .on('drag', this.groupDragged)
            .on('end', this.groupDragEnded)
        )
        .on('click', (_, nodeSelected) => {
          // Emit an event when a group node is clicked
          this.EventEmitter.emit(GraphEvents.EdgeClick, [
            {
              type: 'click',
              name: GraphEvents.NodeGroupClick,
              data: nodeSelected
            }
          ]);
        });

      // Update the fill color of all group node paths
      groupNodesEnter
        .merge(groupNodes)
        .select('path')
        .attr('fill', (groupId) => groupId.color || nodeColorsDefault);
    }
  };

  private redrawNodes = () => {
    const svgNodes = this.getAllNodes().data(this.nodes, ({ id }) => id);

    // update existing node containers
    const svgNodesG = svgNodes.select<SVGGElement>(`.${NODE_CLASS_NAME}`).attr('id', ({ id }) => `node-${id}`);

    // create new node containers
    const svgNodesGEnter = svgNodes
      .enter()
      .append('g')
      .attr('class', NODE_CLASS_NAME)
      .attr('opacity', ({ isDisabled }) => (isDisabled ? 0.2 : 1))
      .attr('id', ({ id }) => `node-${id}`);

    // merge node containers
    const svgNodesGMerge = svgNodesG.merge(svgNodesGEnter);

    // create node circles
    svgNodesGEnter
      .append('circle')
      .attr('r', NODE_SIZE / 2)
      .style('fill', ({ color }) => color);

    // update node circles
    svgNodesG
      .select('circle')
      .attr('r', NODE_SIZE / 2)
      .style('fill', ({ color }) => color);

    // node internal images
    svgNodesGEnter
      .append('image')
      .attr('xlink:href', ({ img }) => img || null)
      .attr('width', NODE_SIZE / 2)
      .attr('x', -NODE_SIZE / 4)
      .attr('y', -NODE_SIZE / 2)
      .attr('height', NODE_SIZE)
      .style('fill', 'white');

    // update node internal images
    svgNodesG
      .select('image')
      .attr('xlink:href', ({ img }) => img || null)
      .attr('width', NODE_SIZE / 2)
      .attr('x', -NODE_SIZE / 4)
      .attr('y', -NODE_SIZE / 2)
      .attr('height', NODE_SIZE)
      .style('fill', 'white');

    // create node labels
    svgNodesGEnter
      .append('text')
      .attr('font-size', ({ id }) => (this.nodeInitialized === id ? FONT_SIZE_DEFAULT * ZOOM_TEXT : FONT_SIZE_DEFAULT))
      .attr('y', NODE_SIZE / 2 + FONT_SIZE_DEFAULT)
      .text(({ name }) => name)
      .attr('id', ({ id }) => `node-label-${id}`)
      .style('fill', SELECTED_TEXT_COLOR);

    // update node labels
    svgNodesG
      .select('text')
      .attr('font-size', ({ id }) => (this.nodeInitialized === id ? FONT_SIZE_DEFAULT * ZOOM_TEXT : FONT_SIZE_DEFAULT))
      .attr('y', NODE_SIZE / 2 + FONT_SIZE_DEFAULT)
      .text(({ name }) => name)
      .attr('id', ({ id }) => `node-label-${id}`)
      .style('fill', SELECTED_TEXT_COLOR);

    // create transparent circles over the images to make a clean drag and drop
    const svgNode = svgNodesGMerge
      .append('circle')
      .attr('r', NODE_SIZE / 2)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .attr('opacity', OPACITY_NO_SELECTED_ITEM * 5)
      .attr('id', ({ id }) => `node-cover-${id}`);

    svgNode.on('mousedown', (_, { id }) => {
      select(`#node-cover-${id}`).style('cursor', 'grab');
    });

    svgNode.on('mouseup', (_, { id }) => {
      select(`#node-cover-${id}`).style('cursor', 'pointer');
    });

    svgNode.on('mouseover', (_, { id }) => {
      this.nodeInitialized = id;
      selectNodeTextStyle(id);

      if (!this.isDraggingNode) {
        this.reStyleEdges();
      }
    });

    svgNode.on('mouseout', (_, { id }) => {
      this.nodeInitialized = undefined;
      deselectNodeTextStyle(id);
      this.reStyleEdges();
    });

    svgNode.on('click', (_, node) => {
      this.reStyleEdges();

      this.EventEmitter.emit(GraphEvents.NodeClick, [
        {
          type: 'click',
          name: GraphEvents.NodeClick,
          data: node
        }
      ]);
    });

    // attach drag and drop events
    svgNodesGEnter.call(
      drag<SVGGElement, GraphNode>().on('start', this.dragStarted).on('drag', this.dragged).on('end', this.dragEnded)
    );
  };

  // exposed methods
  getNodes() {
    return this.nodes;
  }

  /**
   * Start a simulation of nodes with d3 force
   */
  run({
    nodes,
    edges,
    groups = this.groups
  }: {
    nodes: GraphNode[];
    edges: GraphEdge<string>[];
    groups?: GraphGroup[];
  }) {
    // clone nodes and edges to avoid modifying the original data
    const clonedNodeData = deepCloneArray(nodes);
    const clonedEdgeData = deepCloneArray(edges);

    // set the cloned nodes and groupIds to the simulation
    this.nodes = clonedNodeData;
    this.groups = groups;

    // set the cloned edges to the simulation
    this.links = clonedEdgeData.map((edge) => ({
      ...edge,
      source: clonedNodeData.find((node) => node.id === edge.source) as GraphNode,
      target: clonedNodeData.find((node) => node.id === edge.target) as GraphNode
    }));

    // set the nodes to the simulation and update the links
    this.force.nodes(this.nodes);
    this.force.force<ForceLink<GraphNode, GraphEdge>>('link')?.links(this.links);
    this.force.tick(ITERATIONS);

    // update node positions if fx or fy is not defined
    this.nodes.forEach((node) => {
      if (!node.fx || !node.fy) {
        node.fx = node.x;
        node.fy = node.y;
      }
    });

    // clear the SVG container and redraw the graph elements
    this.svgGraphGroup.selectAll('*').remove();
    // To ensure proper rendering of elements based on their respective Z-index values, it is important to maintain the current order.
    this.redrawGroups();
    this.redrawEdges();
    this.redrawNodes();
    this.redrawPositions();
  }

  updateModel = ({
    nodes,
    edges,
    groups
  }: {
    nodes: GraphNode[];
    edges: GraphEdge<string>[];
    groups?: GraphGroup[];
  }) => {
    if (!nodes || !edges) {
      throw new Error('Graph - updateModel: Invalid input data');
    }

    if (!this.isDraggingNode && this.nodes.length) {
      // Create a map of node IDs to their corresponding nodes to help find matching nodes more efficiently

      const nodeIdToNodeMap = this.nodes.reduce((acc, node) => {
        acc[node.id] = node;

        return acc;
      }, {} as Record<string, GraphNode>);

      // Update node data based on whether they are matched to an existing node or a new node
      const updatedNodeData = nodes.map((node) => {
        const matchedNode = nodeIdToNodeMap[node.id];
        // If the node already exists in the model, update its position
        if (matchedNode) {
          const fx = node.x || matchedNode.fx;
          const fy = node.y || matchedNode.fy;

          return { ...node, fx, fy };
        }

        // If the node is new, place it close to the first node of its group or the first node in the topology if the group doesn't exist
        const nodesInGroup = this.nodes.filter(({ group }) => group === node.group);
        const fx = (nodesInGroup.length ? nodesInGroup[0].x : this.nodes[0].x) + NODE_SIZE * 2;
        const fy = (nodesInGroup.length ? nodesInGroup[0].y : this.nodes[0].y) + NODE_SIZE * 2;

        return { ...node, fx, fy };
      });

      this.run({ nodes: updatedNodeData, edges, groups });
    }
  };

  /**
   * Resets the zoom level and position of the graph to its original state.
   */
  zoomToDefaultPosition() {
    const $parent = this.svgGraph.node();

    if (!$parent) {
      return;
    }

    const { width, height } = $parent.getBBox();
    const center: [number, number] = [width / 2, height / 2];
    const transform = zoomTransform($parent).invert(center);

    (this.svgGraph as any).transition().duration(300).call(this.zoom.transform, zoomIdentity, transform);
  }

  increaseZoomLevel() {
    return (this.svgGraph as any).transition().duration(250).call(this.zoom.scaleBy, 1.5);
  }

  decreaseZoomLevel() {
    return (this.svgGraph as any).transition().duration(250).call(this.zoom.scaleBy, 0.5);
  }
}

function animateEdges({ source, target }: { source: { id: string }; target: { id: string } }) {
  (select<SVGSVGElement, GraphEdge>(`#edge${source.id}-${target.id}`) as any)
    .style('stroke', SELECTED_EDGE_COLOR)
    .style('stroke-dasharray', '8, 8')
    .transition()
    .duration(750)
    .ease(easeLinear)
    .styleTween('stroke-dashoffset', () => interpolate('30', '0'))
    .on('end', animateEdges);
}

function stopAnimateEdges({ source, target }: GraphEdge) {
  (select(`#edge${source.id}-${target.id}`) as any)
    .style('stroke', DEFAULT_COLOR)
    .style('stroke-dasharray', '0, 0')
    .transition()
    .on('end', null);
}

function selectNodeTextStyle(id: string) {
  select(`#node-cover-${id}`).attr('fill', 'white');
  (select(`#node-label-${id}`) as any)
    .transition()
    .duration(300)
    .attr('font-size', FONT_SIZE_DEFAULT * ZOOM_TEXT);
}

function deselectNodeTextStyle(id: string) {
  select(`#node-cover-${id}`).attr('fill', 'transparent');
  (select(`#node-label-${id}`) as any).transition().duration(300).attr('font-size', FONT_SIZE_DEFAULT);
}

function addEdgeArrows(container: Selection<SVGGElement, GraphNode, null, undefined>) {
  return container
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
    .attr('d', 'M0,-5L10,0L0,5');
}

function isEdgeBetweenNodes(svgLink: { source: { id: string }; target: { id: string } }, id: string | undefined) {
  if (!id) {
    return false;
  }

  const nodeIds = id.split('-to-');

  return (
    (nodeIds.length === 2 && svgLink.source.id === nodeIds[0] && svgLink.target.id === nodeIds[1]) ||
    id === svgLink.source.id ||
    id === svgLink.target.id
  );
}

/**
 * Generates a polygon hull from a group of nodes in a graph.
 */
function polygonGenerator(nodes: GraphNode[], groupId: string): [number, number][] | null {
  // Validate input parameters
  if (!groupId || !Array.isArray(nodes)) {
    return null;
  }

  // Filter nodes by group ID and get their coordinates
  const nodeCoords: [number, number][] = nodes.filter(({ group }) => group === groupId).map(({ x, y }) => [x, y]);

  // Ensure there are at least three nodes to create a polygon
  if (nodeCoords.length < 3) {
    // If there are less than three nodes, add additional nodes with NODE_SIZE distance and close to the first one
    // If this is an empty group, use default coordinates [0, 0]
    const [x, y] = nodeCoords[0] || [0, 0];

    for (let i = nodeCoords.length; i < 3; i++) {
      nodeCoords.push([x + NODE_SIZE * i, y + NODE_SIZE * i]);
    }
  }

  // Generate the polygon hull from the node coordinates
  const polygon = polygonHull(nodeCoords);

  // Return the polygon hull, or null if it couldn't be generated
  return polygon || null;
}

/**
 * Convert a GraphEdge object with string source and target properties to a GraphEdge object
 * with GraphNode source and target properties.
 */
export function mapGraphEdges(edges: GraphEdge<string>[], nodes: GraphNode[]): GraphEdge<GraphNode>[] {
  return edges.map((edge, index) => ({
    index,
    source: nodes.find((node) => node.id === edge.source) as GraphNode,
    target: nodes.find((node) => node.id === edge.target) as GraphNode
  }));
}
