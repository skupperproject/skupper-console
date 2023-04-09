import { drag } from 'd3-drag';
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
import { polygonCentroid } from 'd3-polygon';
import { scaleOrdinal } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { line, curveCardinalClosed } from 'd3-shape';

import EventEmitter from '@core/components/Graph/EventEmitter';
import { deepCloneArray } from '@core/utils/deepCloneArray';

import {
  EDGE_CLASS_NAME,
  FONT_SIZE_DEFAULT,
  GROUP_NODE_PATHS_CLASS_NAME,
  ITERATIONS,
  NODE_CLASS_NAME,
  NODE_SIZE,
  OPACITY_NO_SELECTED_ITEM,
  SELECTED_TEXT_COLOR
} from './config';
import { nodeColorsDefault } from './Graph.constants';
import { GraphEvents } from './Graph.enum';
import { GraphNode, GraphEdge, GraphProps, GraphGroup, GraphNodeWithForce } from './Graph.interfaces';
import { GraphController } from './services';
import GraphZoom from './Zoom';

export default class Graph {
  $root: HTMLElement;
  nodes: GraphNodeWithForce[];
  links: GraphEdge[];
  width: number;
  height: number;
  force: Simulation<GraphNodeWithForce, GraphEdge>;
  svgGraph: Selection<SVGSVGElement, GraphNodeWithForce, null, undefined>;
  svgGraphGroup: Selection<SVGGElement, GraphNodeWithForce, null, undefined>;
  isDraggingNode: boolean;
  zoom: GraphZoom;
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

    this.svgGraph = this.createGraphContainer();
    this.svgGraphGroup = this.createGraphGroup();
    this.zoom = new GraphZoom({ svgGraph: this.svgGraph, svgGraphGroup: this.svgGraphGroup });
  }

  private configureForceSimulation() {
    // create two scales for x and y axes
    const xScale = scaleOrdinal<string, number>();
    const yScale = scaleOrdinal<string, number>();

    // define a function to calculate the x-coordinate of a node
    const getNodeX = ({ group, fx }: GraphNodeWithForce) => {
      const domain = this.groups || this.nodes;
      // map each id to a corresponding x-coordinate and set it as the domain for the x-scale
      xScale.domain(domain.map(({ id }) => id)).range(domain.map((_, i) => (this.width / domain.length) * i));

      // if the node has a pre-set x-coordinate, use that, otherwise calculate the position based on its group
      return fx || Math.min(xScale(group) as number, this.width - NODE_SIZE);
    };

    // define a function to calculate the y-coordinate of a node
    const getNodeY = ({ group, fy }: GraphNodeWithForce) => {
      const domain = this.groups || this.nodes;
      // set the range of the y-scale to be within the bounds of the graph
      yScale.domain(domain.map(({ id }) => id)).range([NODE_SIZE, this.height - NODE_SIZE * 2]);

      // if the node has a pre-set y-coordinate, use that, otherwise calculate the position based on its group
      return fy || Math.min(yScale(group) as number, this.height - NODE_SIZE * 2);
    };

    const linkForce = forceLink<GraphNodeWithForce, GraphEdge>()
      .distance(25)
      .id(({ id }) => id);

    return forceSimulation<GraphNodeWithForce, GraphEdge>()
      .force('center', forceCenter(this.width / 2, this.height / 2))
      .force('charge', forceManyBody())
      .force('collide', forceCollide().radius(NODE_SIZE * 2))
      .force('x', forceX<GraphNodeWithForce>().x(getNodeX).strength(0.8))
      .force('y', forceY<GraphNodeWithForce>().y(getNodeY).strength(0.8))
      .force('link', linkForce)
      .stop(); // stop the simulation (since we only want to run it once to set the initial positions)
  }

  private createGraphContainer() {
    return select<HTMLElement, GraphNodeWithForce>(this.$root)
      .append('svg')
      .attr('class', 'graph-container')
      .attr('width', '100%')
      .attr('height', '100%');
  }

  private createGraphGroup() {
    return this.svgGraph.append('g').attr('class', 'graph-draw-container').attr('width', '100%').attr('height', '100%');
  }

  private getAllNodes() {
    return this.svgGraphGroup.selectAll<SVGSVGElement, GraphNodeWithForce>(`.${NODE_CLASS_NAME}`);
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

  private dragStarted = (_: {}, node: GraphNodeWithForce) => {
    this.isDraggingNode = true;

    node.fx = node.x;
    node.fy = node.y;

    this.force.tick(1);
    this.redrawPositions();
  };

  private dragged = ({ x, y }: { x: number; y: number }, node: GraphNodeWithForce) => {
    node.fx = x;
    node.fy = y;

    this.force.tick(1);
    this.redrawPositions();
  };

  private dragEnded = (_: {}, node: GraphNodeWithForce) => {
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
    if (!this.groups) {
      return;
    }

    const groupPaths = this.svgGraphGroup.selectAll<SVGPathElement, GraphGroup>(`.${GROUP_NODE_PATHS_CLASS_NAME}`);

    this.groups.forEach(({ id: groupId }) => {
      let centroid: [number, number] = [0, 0];
      let points: [number, number][] = [[0, 0]];

      const paths = groupPaths
        .filter(({ id }) => id === groupId)
        .attr('transform', 'scale(1) translate(0,0)')
        .attr('d', ({ id }) => {
          const polygon = GraphController.polygonGenerator(this.nodes, id);

          centroid = polygon ? polygonCentroid(polygon) : [0, 0];
          // point is an array that contains array [x,y]
          points = (polygon || []).map((point) => [point[0] - centroid[0] || 0, point[1] - centroid[1] || 0]);

          const createCurve = line()
            .x((d) => d[0])
            .y((d) => d[1])
            .curve(curveCardinalClosed);

          return createCurve(points);
        });

      const path = paths.filter(({ id }) => id === groupId).node();

      if (path) {
        const $parentNode = path.parentNode as HTMLElement | null;

        // move group
        select($parentNode).attr('transform', `translate(${centroid[0]},${centroid[1]}) scale(${1.5})`); // scale works as a padding around the nodes

        // move group labels
        const yValues = points.flatMap((point) => point[1]);

        const y = Math.min(...yValues);
        const x = points.filter((point) => point[1] === y)[0][0];

        this.svgGraphGroup
          .select(`#group-label-${groupId}`)
          .attr('x', x)
          .attr('y', y - FONT_SIZE_DEFAULT);
      }
    });
  };

  private redrawEdges = () => {
    GraphController.addEdgeArrows(this.svgGraphGroup);

    const links = this.links as GraphEdge[];

    // draw the line
    this.getAllEdges()
      .data(links)
      .join('line')
      .style('stroke-width', '1px')
      .attr('id', ({ source, target }) => `edge${source.id}-${target.id}`)
      .attr('class', EDGE_CLASS_NAME)
      .attr('marker-end', 'url(#arrow)');

    // draw the clickable shadow line
    this.getAllEdgesPaths()
      .data(links)
      .join('path')
      .attr('id', ({ source, target }) => `edge-path${source.id}-${target.id}`)
      .attr('class', `${EDGE_CLASS_NAME}_path`)
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .style('pointer-events', 'visibleStroke')
      .attr('stroke-width', '30px')
      .style('cursor', (data) => (data.clickable ? 'pointer' : 'default'))
      .on('mouseover', (_, { source, target }) => {
        if (!this.isDraggingNode) {
          this.nodeInitialized = `${source.id}-to-${target.id}`;
          this.reStyleEdges();
        }
      })
      .on('mouseout', () => {
        if (!this.isDraggingNode) {
          this.nodeInitialized = undefined;
          this.reStyleEdges();
        }
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
      // TODO: this code probably it's unnecessary because handled in stop and animateEdges. Test all use cases before remove this code.
      // .style('stroke-dasharray', ({ type, source, target }) =>
      //   type === 'dashed' || GraphController.isEdgeBetweenNodes({ source, target }, nodeId) ? '8,8' : '0,0'
      // )
      .each((svgLink) => {
        if (!GraphController.isEdgeBetweenNodes(svgLink, nodeId)) {
          GraphController.stopAnimateEdges(svgLink);
        }

        if (GraphController.isEdgeBetweenNodes(svgLink, nodeId)) {
          GraphController.animateEdges(svgLink);
        }
      });
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
        .attr('id', ({ id }) => `group-path-${id}`)
        .attr('class', GROUP_NODE_PATHS_CLASS_NAME)
        .attr('fill', ({ color }) => color || nodeColorsDefault)
        .attr('stroke', ({ color }) => color || nodeColorsDefault)
        .attr('stroke-width', NODE_SIZE)
        .attr('stroke-linejoin', 'round')
        .attr('opacity', OPACITY_NO_SELECTED_ITEM)
        .style('cursor', 'pointer')
        .call(
          drag<SVGPathElement, GraphGroup>()
            .on('start', (e, group) => {
              this.groupDragStarted(e, group);
              select(`#group-path-${group.id}`).style('cursor', 'grab');
            })
            .on('drag', this.groupDragged)
            .on('end', (e, group) => {
              this.groupDragEnded(e, group);
              select(`#group-path-${group.id}`).style('cursor', 'pointer');
            })
        )
        .on('click', (_, nodeSelected) => {
          // Emit an event when a group node is clicked
          this.EventEmitter.emit(GraphEvents.GroupNodesClick, [
            {
              type: 'click',
              name: GraphEvents.GroupNodesClick,
              data: nodeSelected
            }
          ]);
        });

      // append the text element to the new container
      groupNodesEnter
        .merge(groupNodes)
        .append('text')
        .attr('id', ({ id }) => `group-label-${id}`)
        .attr('class', `${GROUP_NODE_PATHS_CLASS_NAME}-label`)
        .text(({ name }) => name)
        .attr('font-size', FONT_SIZE_DEFAULT);
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
      .attr('opacity', ({ style }) => style.opacity || 1)
      .attr('id', ({ id }) => `node-${id}`);

    // merge node containers
    const svgNodesGMerge = svgNodesG.merge(svgNodesGEnter);

    // create node circles
    svgNodesGEnter
      .append('circle')
      .attr('r', NODE_SIZE / 2)
      .attr('opacity', OPACITY_NO_SELECTED_ITEM * 5)
      .style('fill', ({ style }) => style.fill);

    // update node circles
    svgNodesG
      .select('circle')
      .attr('r', NODE_SIZE / 2)
      .style('fill', ({ style }) => style.fill);

    // node internal images
    svgNodesGEnter
      .append('image')
      .attr('xlink:href', ({ style }) => style.img || null)
      .attr('width', NODE_SIZE / 2)
      .attr('x', -NODE_SIZE / 4)
      .attr('y', -NODE_SIZE / 2)
      .attr('height', NODE_SIZE)
      .style('fill', 'white');

    // update node internal images
    svgNodesG
      .select('image')
      .attr('xlink:href', ({ style }) => style.img || null)
      .attr('width', NODE_SIZE / 2)
      .attr('x', -NODE_SIZE / 4)
      .attr('y', -NODE_SIZE / 2)
      .attr('height', NODE_SIZE)
      .style('fill', 'white');

    // create node labels
    svgNodesGEnter
      .append('g')
      .append('text')
      .attr('font-size', FONT_SIZE_DEFAULT)
      .attr('y', NODE_SIZE)
      .text(({ label }) => label)
      .attr('id', ({ id }) => `node-label-${id}`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', SELECTED_TEXT_COLOR)
      .each(function ({ id }) {
        const textNode = select<SVGSVGElement, GraphNodeWithForce>(`#node-label-${id}`);
        const textNodeElement = textNode.node();

        if (textNodeElement) {
          const gTextBox = select(this.parentNode as SVGGElement);
          const { x, y, width, height } = textNodeElement.getBBox();

          gTextBox
            .insert('rect', ':first-child')
            .attr('id', `node-label-container-${id}`)
            .attr('x', x - 5)
            .attr('y', y - 2.5)
            .attr('width', width + 10)
            .attr('height', height + 5)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('opacity', 0.5)
            .style('fill', 'white')
            .style('stroke', 'grey')
            .style('stroke-width', 1);
        }
      });
    // create transparent circles over the images to make a clean drag and drop
    const svgNode = svgNodesGMerge
      .append('circle')
      .attr('r', NODE_SIZE / 2)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .attr('opacity', OPACITY_NO_SELECTED_ITEM * 5)
      .attr('id', ({ id }) => `node-cover-${id}`)
      .style('stroke-width', 1)
      .attr('stroke', ({ style }) => style.fill);

    svgNode.on('mouseover', (_, { id }) => {
      if (!this.isDraggingNode) {
        this.nodeInitialized = id;
        GraphController.selectNodeTextStyle(id);

        this.reStyleEdges();
      }
    });

    svgNode.on('mouseout', (_, { id }) => {
      if (!this.isDraggingNode) {
        this.nodeInitialized = undefined;
        GraphController.deselectNodeTextStyle(id);

        this.reStyleEdges();
      }
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
      drag<SVGGElement, GraphNodeWithForce>()
        .on('start', (e, node) => {
          this.dragStarted(e, node);
          select(`#node-cover-${node.id}`).style('cursor', 'grab');
        })
        .on('drag', this.dragged)
        .on('end', (e, node) => {
          this.dragEnded(e, node);
          select(`#node-cover-${node.id}`).style('cursor', 'pointer');
        })
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

    this.groups = groups;

    // set the cloned nodes  to the simulation
    this.nodes = clonedNodeData.map((node) => ({
      ...node,
      x: node.x || 0,
      y: node.y || 0,
      fx: node.x,
      fy: node.y
    }));

    // set the cloned edges to the simulation
    this.links = clonedEdgeData.map((edge) => ({
      ...edge,
      source: this.nodes.find((node) => node.id === edge.source) as GraphNodeWithForce,
      target: this.nodes.find((node) => node.id === edge.target) as GraphNodeWithForce
    }));

    // set the nodes to the simulation and update the links
    this.force.nodes(this.nodes);
    this.force.force<ForceLink<GraphNodeWithForce, GraphEdge>>('link')?.links(this.links);
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
      }, {} as Record<string, GraphNodeWithForce>);

      // Update node data based on whether they are matched to an existing node or a new node
      const updatedNodeData = nodes.map((node): GraphNode => {
        const matchedNode = nodeIdToNodeMap[node.id];
        // If the node already exists in the model, update its position
        if (matchedNode) {
          const x = node.x || matchedNode.fx;
          const y = node.y || matchedNode.fy;

          return { ...node, x, y };
        }

        // If the node is new, place it close to the first node of its group or the first node in the topology if the group doesn't exist
        const nodesInGroup = this.nodes.filter(({ group }) => group === node.group);
        const x = (nodesInGroup.length ? nodesInGroup[0].x : this.nodes[0].x) + NODE_SIZE * 2;
        const y = (nodesInGroup.length ? nodesInGroup[0].y : this.nodes[0].y) + NODE_SIZE * 2;

        return { ...node, x, y };
      });

      this.run({ nodes: updatedNodeData, edges, groups });
    }
  };

  /**
   * Resets the zoom level and position of the graph to its original state.
   */
  zoomToDefaultPosition() {
    this.zoom.zoomToDefaultPosition();
  }

  increaseZoomLevel() {
    this.zoom.increaseZoomLevel();
  }

  decreaseZoomLevel() {
    this.zoom.decreaseZoomLevel();
  }
}
