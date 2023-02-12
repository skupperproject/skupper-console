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
    forceManyBody,
} from 'd3-force';
import { interpolate } from 'd3-interpolate';
import { polygonCentroid, polygonHull } from 'd3-polygon';
import { scaleOrdinal } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { line, curveCardinalClosed } from 'd3-shape';
import { zoom, zoomTransform, zoomIdentity, ZoomBehavior } from 'd3-zoom';

import EventEmitter from '@core/components/Graph/EventEmitter';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import { GraphEvents } from './Graph.enum';
import { GraphNode, GraphEdge, GraphEdgeModifiedByForce } from './Graph.interfaces';
import { colors } from '../../../pages/Topology/Topology.constant';

const ARROW_SIZE = 10;
const NODE_SIZE = 40;
const FONT_SIZE_DEFAULT = 12;
const OPACITY_NO_SELECTED_ITEM = 0.1;

const ALPHA_FORCE = 0.1;
const ALPHA_MIN_FORCE = 0.065;
const ALPHA_TARGET_DRAG = 0.3;

const NODE_CLASS_NAME = 'node';
const GROUP_NODE_PATHS_CLASS_NAME = 'group-node-paths';
const EDGE_CLASS_NAME = 'edge';

const ZOOM_TEXT = 1.5;
const DEFAULT_COLOR = 'var(--pf-global--palette--black-300)';
const SELECTED_EDGE_COLOR = 'var(--pf-global--palette--blue-300)';
const SELECTED_TEXT_COLOR = 'var(--pf-global--palette--black-800)';

export default class Graph {
    $root: HTMLElement;
    nodes: GraphNode[];
    links: GraphEdge[] | GraphEdgeModifiedByForce[];
    width: number;
    height: number;
    force: Simulation<GraphNode, GraphEdgeModifiedByForce>;
    svgGraph: Selection<SVGSVGElement, GraphNode, null, undefined>;
    svgGraphGroup: Selection<SVGGElement, GraphNode, null, undefined>;
    isDraggingNode: boolean;
    zoom: ZoomBehavior<SVGSVGElement, GraphNode>;
    groupIds: string[];
    nodeInitialized: null | string;
    selectedNode: null | string;
    EventEmitter: EventEmitter;
    options: { showGroup?: boolean | undefined } | undefined;
    isGraphLoaded: boolean;

    constructor(
        $node: HTMLElement,
        nodes: GraphNode[],
        edges: GraphEdge[],
        boxWidth: number,
        boxHeight: number,
        options?: { showGroup?: boolean },
        nodeInitialized?: string | null,
    ) {
        this.$root = $node;
        this.nodes = nodes;
        this.links = edges;
        this.nodeInitialized = nodeInitialized || null;
        this.selectedNode = null;
        this.groupIds = [];

        this.width = boxWidth;
        this.height = boxHeight;
        this.options = options;

        this.isDraggingNode = false;
        this.isGraphLoaded = false;

        this.svgGraph = this.createGraphContainer();
        this.svgGraphGroup = this.createGraphGroup();

        this.EventEmitter = new EventEmitter();

        this.force = this.initForce(this.nodes);

        this.zoom = zoom<SVGSVGElement, GraphNode>().scaleExtent([0.5, 4]);
        this.zoom.on('zoom', ({ transform }) => {
            this.svgGraphGroup.attr('transform', transform);
        });

        // It enables the movement/zoom of the topology with the track pad
        this.svgGraph.call(this.zoom);
    }

    private createGraphContainer() {
        return select<HTMLElement, GraphNode>(this.$root)
            .append('svg')
            .attr('class', 'graph-container')
            .attr('width', '100%')
            .attr('height', '100%');
    }

    private createGraphGroup() {
        return this.svgGraph
            .append('g')
            .attr('class', 'graph-draw-container')
            .attr('width', '100%')
            .attr('height', '100%');
    }

    private getAllNodes() {
        return this.svgGraphGroup.selectAll<SVGSVGElement, GraphNode>(`.${NODE_CLASS_NAME}`);
    }

    private getAllEdges() {
        return this.svgGraphGroup.selectAll<SVGSVGElement, GraphEdgeModifiedByForce>(
            `.${EDGE_CLASS_NAME}`,
        );
    }

    private getAllEdgesPaths() {
        return this.svgGraphGroup.selectAll<SVGSVGElement, GraphEdgeModifiedByForce>(
            `.${EDGE_CLASS_NAME}_path`,
        );
    }

    private getAllEdgesLabels() {
        return this.svgGraphGroup.selectAll<SVGSVGElement, GraphEdgeModifiedByForce>(
            `.${EDGE_CLASS_NAME}_label`,
        );
    }

    private dragStarted = ({ active }: { active: boolean }, node: GraphNode) => {
        if (!active) {
            this.force.alphaTarget(ALPHA_TARGET_DRAG).restart();
        }

        node.fx = node.x;
        node.fy = node.y;

        this.isDraggingNode = true;
    };

    private dragged = ({ x, y }: { x: number; y: number }, node: GraphNode) => {
        node.fx = x;
        node.fy = y;
    };

    private dragEnded = ({ active }: { active: boolean }, node: GraphNode) => {
        if (!active) {
            this.force.alphaTarget(0);
            this.force.stop();
        }

        this.isDraggingNode = false;
        this.EventEmitter.emit(GraphEvents.IsDraggingNodeEnd, [node]);
    };

    private groupDragStarted = (
        { x, y, active }: { x: number; y: number; active: boolean },
        groupId: string,
    ) => {
        if (!active) {
            this.force.alphaTarget(ALPHA_TARGET_DRAG).restart();
        }

        this.nodes
            .filter(({ group }) => group === Number(groupId))
            .forEach((node) => {
                node.groupFx = x;
                node.groupFy = y;
            });

        this.isDraggingNode = true;
    };

    private groupDragged = ({ x, y }: { x: number; y: number }, groupId: string) => {
        this.nodes
            .filter(({ group }) => group === Number(groupId))
            .forEach((node) => {
                node.fx = node.x + x - (node.groupFx || 0);
                node.fy = node.y + y - (node.groupFy || 0);
            });
    };

    private groupDragEnded = ({ active }: { active: boolean }, groupId: string) => {
        if (!active) {
            this.force.alphaTarget(0);
            this.force.stop();
        }

        this.isDraggingNode = false;
        this.EventEmitter.emit(GraphEvents.IsDraggingNodesEnd, [
            this.nodes.filter(({ group }) => group === Number(groupId)),
        ]);
    };

    private ticked = () => {
        // move nodes
        this.getAllNodes().attr(
            'transform',
            ({ x, y }) => `translate(
                    ${x},
                    ${y}
                )`,
        );

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
        this.moveGroupNodes();
    };

    private moveGroupNodes() {
        if (this.options?.showGroup) {
            this.groupIds.forEach((groupId) => {
                let centroid: [number, number] = [0, 0];

                const paths = this.svgGraphGroup
                    .selectAll<SVGPathElement, string>(`.${GROUP_NODE_PATHS_CLASS_NAME}`)
                    .filter((id) => id === groupId)
                    .attr('transform', 'scale(1) translate(0,0)')
                    .attr('d', (id) => {
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

                const $parentNode = paths.filter((id) => id === groupId).node()
                    ?.parentNode as HTMLElement | null;

                select($parentNode).attr(
                    'transform',
                    `translate(${centroid[0]},${centroid[1]}) scale(${1.5})`,
                );
            });
        }
    }

    private initForce(nodes: GraphNode[]) {
        const domain = nodes.reduce((acc, node) => {
            acc[node.group] = true;

            return acc;
        }, {} as Record<string, boolean>);

        const domainValues = Object.keys(domain);
        const rangeValuesX = domainValues.map((_, i) => (i ? (this.width - NODE_SIZE) / i : 0));
        const rangeValuesY = domainValues.map((_, i) =>
            i ? (this.height / domainValues.length) * i : 100,
        );

        const xScale = scaleOrdinal().domain(domainValues).range(rangeValuesX);
        const yScale = scaleOrdinal().domain(domainValues).range(rangeValuesY);

        return forceSimulation<GraphNode, GraphEdgeModifiedByForce>()
            .force('center', forceCenter(this.width / 2, this.height / 2))
            .force('charge', forceManyBody().strength(-80))
            .force('collide', forceCollide().radius(NODE_SIZE * 2))
            .alpha(ALPHA_FORCE)
            .alphaMin(ALPHA_MIN_FORCE)
            .force(
                'x',
                forceX<GraphNode>()
                    .strength(1)
                    .x(function ({ group, fx }) {
                        if (fx) {
                            return fx;
                        }

                        return xScale(group.toString()) as number;
                    }),
            )
            .force(
                'y',
                forceY<GraphNode>()
                    .strength(1)
                    .y(({ group, fy }) => {
                        if (fy) {
                            return fy;
                        }

                        return yScale(group.toString()) as number;
                    }),
            )
            .force(
                'link',
                forceLink<GraphNode, GraphEdgeModifiedByForce>()
                    .distance(20)
                    .strength(1)
                    .iterations(1)
                    .id(({ id }) => id),
            )
            .on('end', () => {
                if (!this.isGraphLoaded) {
                    this.EventEmitter.emit(GraphEvents.IsGraphLoaded, [this.nodes]);
                    this.isGraphLoaded = true;
                }

                this.nodes.forEach((node) => {
                    node.fx = node.x;
                    node.fy = node.y;
                });

                this.force.stop();
            });
    }

    private redrawEdges = () => {
        addEdgeArrows(this.svgGraphGroup);
        // links services
        const svgEdgesData = this.getAllEdges()
            .data(this.links as GraphEdgeModifiedByForce[])
            .enter();

        const svgEdgesPaths = this.getAllEdgesPaths()
            .data(this.links as GraphEdgeModifiedByForce[])
            .enter();

        const svgEdgesLabels = this.getAllEdgesLabels()
            .data(this.links as GraphEdgeModifiedByForce[])
            .enter();

        // create edge line with arrow
        svgEdgesData
            .append('line')
            .style('stroke-width', '1px')
            .attr('id', ({ source, target }) => `edge${source.id}-${target.id}`)
            .attr('class', EDGE_CLASS_NAME)
            .attr('marker-end', 'url(#arrow)');

        // create a transparent path to place the label
        svgEdgesPaths
            .append('path')
            .attr('class', `${EDGE_CLASS_NAME}_path`)
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', ({ source, target }) => `edge-path${source.id}-${target.id}`)
            .style('pointer-events', 'visibleStroke')
            .attr('stroke', DEFAULT_COLOR)
            .attr('stroke-width', '30px')
            .style('cursor', 'pointer')
            .on('mouseover', (_, { source, target }) => {
                this.nodeInitialized = `${source.id}-to-${target.id}`;
                this.reStyleEdges();
            })
            .on('mouseout', () => {
                this.nodeInitialized = null;
                this.reStyleEdges();
            })
            .on('click', (_, nodeSelected) => {
                this.EventEmitter.emit(GraphEvents.EdgeClick, [
                    {
                        type: 'click',
                        name: GraphEvents.EdgeClick,
                        data: { ...nodeSelected },
                    },
                ]);
            });

        // create edge label
        const text = svgEdgesLabels
            .append('text')
            .style('pointer-events', 'none')
            .attr('class', `${EDGE_CLASS_NAME}_label`)
            .attr('id', ({ source, target }) => `edge-label${source.id}-${target.id}`)
            .attr('font-size', DEFAULT_TABLE_PAGE_SIZE)
            .style('transform', 'translate(0px,-5px)');

        text.append('textPath') //To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
            .attr('xlink:href', ({ source, target }) => `#edge-path${source.id}-${target.id}`)
            .style('text-anchor', 'middle')
            .style('fill', DEFAULT_COLOR)
            .attr('startOffset', '50%')
            .text(() => '');

        this.reStyleEdges();
    };

    private reStyleEdges() {
        const nodeId = this.selectedNode || this.nodeInitialized;

        this.getAllEdges()
            .each((svgLink) => {
                if (!isEdgeBetweenNodes(svgLink, nodeId)) {
                    stopAnimateEdges(svgLink);
                }

                if (!this.selectedNode && isEdgeBetweenNodes(svgLink, nodeId)) {
                    animateEdges(svgLink);
                }
            })
            .style('stroke-dasharray', ({ type, source, target }) =>
                type === 'dashed' || isEdgeBetweenNodes({ source, target }, nodeId) ? '8,8' : '0,0',
            );
    }

    private redrawGroups = () => {
        if (this.options?.showGroup) {
            const nodes = this.nodes;
            this.groupIds = Array.from(new Set(nodes.map((n) => n.group.toString())))
                .map((groupId) => ({
                    groupId,
                    count: nodes.filter((n) => n.group === Number(groupId)).length,
                }))
                .filter((group) => group.count > 0)
                .map((group) => group.groupId);

            this.svgGraphGroup
                .selectAll('.group_node') // for performance we select the group class instead every  paths of the group
                .data(this.groupIds)
                .enter()
                .append('g')
                .attr('class', 'group_node')
                .append('path')
                .attr('class', GROUP_NODE_PATHS_CLASS_NAME)
                .attr('fill', (groupId) => colors[Number(groupId)])
                .attr('opacity', OPACITY_NO_SELECTED_ITEM)
                .style('cursor', 'grab')
                .call(
                    drag<SVGPathElement, string>()
                        .on('start', this.groupDragStarted)
                        .on('drag', this.groupDragged)
                        .on('end', this.groupDragEnded),
                )
                .on('click', (_, nodeSelected) => {
                    this.EventEmitter.emit(GraphEvents.EdgeClick, [
                        {
                            type: 'click',
                            name: GraphEvents.NodeGroupClick,
                            data: nodeSelected,
                        },
                    ]);
                });
        }
    };

    private redrawNodes = () => {
        const svgNodes = this.getAllNodes().data(this.nodes).enter();

        // create node containers
        const svgNodesG = svgNodes
            .append('g')
            .attr('class', NODE_CLASS_NAME)
            .attr('id', ({ id }) => `node-${id}`);

        // create node circles
        svgNodesG
            .append('circle')
            .attr('r', NODE_SIZE / 2)
            .style('fill', ({ color }) => color);

        // node internal images
        svgNodesG
            .append('image')
            .attr('xlink:href', ({ img }) => img || null)
            .attr('width', NODE_SIZE / 2)
            .attr('x', -NODE_SIZE / 4)
            .attr('y', -NODE_SIZE / 2)
            .attr('height', NODE_SIZE)
            .style('fill', 'white');

        // create text labels
        svgNodesG
            .append('text')
            .attr('font-size', ({ id }) =>
                this.nodeInitialized === id || this.selectedNode === id
                    ? FONT_SIZE_DEFAULT * ZOOM_TEXT
                    : FONT_SIZE_DEFAULT,
            )
            .attr('y', NODE_SIZE / 2 + FONT_SIZE_DEFAULT)
            .style('fill', DEFAULT_COLOR)
            .text(({ name }) => name)
            .attr('id', ({ id }) => `node-label-${id}`);

        // create transparent circles over the images to make a clean drag and drop
        const svgNode = svgNodesG
            .append('circle')
            .attr('r', NODE_SIZE / 2)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer')
            .attr('id', ({ id }) => `node-cover-${id}`);

        svgNode.on('mousedown', (_, { id }) => {
            select(`#node-cover-${id}`).style('cursor', 'grab');
        });

        svgNode.on('mouseover', (_, { id }) => {
            this.nodeInitialized = id;
            selectElementStyle(id);

            if (!this.isDraggingNode && !this.selectedNode) {
                this.reStyleEdges();
            }
        });

        svgNode.on('mouseout', (_, { id }) => {
            this.nodeInitialized = null;
            deselectElementStyle(id);
            this.reStyleEdges();
        });

        svgNode.on('click', (_, node) => {
            if (node.isDisabled) {
                return;
            }

            const id = node.id;
            if (this.selectedNode === id) {
                this.selectedNode = null;
            } else {
                this.selectedNode = id;
            }

            highlightSelectedNode(this.getAllNodes(), this.selectedNode);
            this.reStyleEdges();

            this.EventEmitter.emit(GraphEvents.NodeClick, [
                {
                    type: 'click',
                    name: GraphEvents.NodeClick,
                    data: { ...node, id: this.selectedNode },
                },
            ]);
        });

        highlightSelectedNode(this.getAllNodes(), this.selectedNode);

        // attach drag and drop events
        svgNodesG.call(
            drag<SVGGElement, GraphNode>()
                .on('start', this.dragStarted)
                .on('drag', this.dragged)
                .on('end', (event, node) => {
                    this.dragEnded(event, node);
                    select(`#node-cover-${node.id}`).style('cursor', 'pointer');
                }),
        );
    };

    // exposed methods
    updateTopology = (nodes: GraphNode[], edges: GraphEdge[], options?: { showGroup: boolean }) => {
        if (!this.isDraggingNode) {
            this.options = { ...this.options, showGroup: !!options?.showGroup };

            this.svgGraphGroup.selectAll('*').remove();
            this.links = JSON.parse(JSON.stringify(edges));
            this.nodes = JSON.parse(JSON.stringify(nodes));

            this.force.nodes(this.nodes).on('tick', this.ticked);
            this.force
                .force<ForceLink<GraphNode, GraphEdge | GraphEdgeModifiedByForce>>('link')
                ?.links(this.links);

            this.force.restart();

            this.redrawGroups();
            this.redrawEdges();
            this.redrawNodes();
        }
    };

    zoomReset() {
        const $parent = this.svgGraph.node();

        if ($parent) {
            this.svgGraph
                .transition()
                .duration(500)
                .call(
                    this.zoom.transform,
                    zoomIdentity,
                    zoomTransform($parent).invert([
                        $parent.getBBox().width / 2,
                        $parent.getBBox().height / 2,
                    ]),
                );
        }
    }

    zoomIn() {
        return this.svgGraph.transition().duration(500).call(this.zoom.scaleBy, 1.5);
    }

    zoomOut() {
        return this.svgGraph.transition().duration(500).call(this.zoom.scaleBy, 0.5);
    }

    deselectAll() {
        this.selectedNode = null;
        this.redrawGroups();
        this.redrawEdges();
        this.redrawNodes();
        this.getAllEdges().each(stopAnimateEdges);
    }
}

function animateEdges({ source, target }: { source: { id: string }; target: { id: string } }) {
    select<SVGSVGElement, GraphEdgeModifiedByForce>(`#edge${source.id}-${target.id}`)
        .style('stroke', SELECTED_EDGE_COLOR)
        .style('stroke-dasharray', '8, 8')
        .transition()
        .duration(750)
        .ease(easeLinear)
        .styleTween('stroke-dashoffset', () => interpolate('30', '0'))
        .on('end', animateEdges);
}

function stopAnimateEdges({ source, target }: GraphEdgeModifiedByForce) {
    select(`#edge${source.id}-${target.id}`)
        .style('stroke', DEFAULT_COLOR)
        .style('stroke-dasharray', '0, 0')
        .transition()
        .on('end', null);
}

function selectElementStyle(id: string) {
    select(`#node-label-${id}`)
        .transition()
        .duration(300)
        .style('fill', SELECTED_TEXT_COLOR)
        .attr('font-size', DEFAULT_TABLE_PAGE_SIZE * ZOOM_TEXT);
}

function deselectElementStyle(id: string) {
    select(`#node-label-${id}`)
        .transition()
        .duration(300)
        .style('fill', DEFAULT_COLOR)
        .attr('font-size', DEFAULT_TABLE_PAGE_SIZE);
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

function highlightSelectedNode(
    nodes: Selection<SVGSVGElement, GraphNode, SVGGElement, GraphNode>,
    selectedNodeId: string | null,
) {
    nodes.style('opacity', ({ id, isDisabled }) => {
        if ((selectedNodeId && id !== selectedNodeId) || isDisabled) {
            return OPACITY_NO_SELECTED_ITEM;
        }

        return '1';
    });
}

function isEdgeBetweenNodes(
    svgLink: { source: { id: string }; target: { id: string } },
    id: string | null,
) {
    const nodeIds = id?.split('-to-');

    if (
        nodeIds?.length === 2 &&
        svgLink.source.id === nodeIds[0] &&
        svgLink.target.id === nodeIds[1]
    ) {
        return true;
    }

    return id === svgLink.source.id || id === svgLink.target.id;
}

function polygonGenerator(nodes: GraphNode[], groupId: string) {
    const node_coords: [number, number][] = nodes
        .filter(({ group }) => group === Number(groupId))
        .map(({ x, y }) => [x, y]);

    // When the number of the nodes is less than 3, we need to create fake points x,y to create a polygon. At least 3.
    if (node_coords.length < 3) {
        node_coords.push([node_coords[0][0] + NODE_SIZE, node_coords[0][1]]);
        node_coords.push([node_coords[0][0] - NODE_SIZE, node_coords[0][1]]);
        node_coords.push([node_coords[0][0], node_coords[0][1] + NODE_SIZE]);
        node_coords.push([node_coords[0][0], node_coords[0][1] - NODE_SIZE]);
    }

    return polygonHull(node_coords);
}
