import { easeLinear } from 'd3';
import { set } from 'd3-collection';
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
    forceManyBody,
} from 'd3-force';
import { interpolate } from 'd3-interpolate';
import { polygonCentroid, polygonHull } from 'd3-polygon';
import { scaleOrdinal } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { Line, line, curveCardinalClosed } from 'd3-shape';
import { zoom, zoomTransform, zoomIdentity, ZoomBehavior } from 'd3-zoom';

import EventEmitter from '@core/components/Graph/EventEmitter';

import { GraphEvents } from './Graph.enum';
import { GraphNode, GraphEdge, GraphEdgeModifiedByForce } from './Graph.interfaces';
import { colors } from '../../../pages/Topology/Topology.constant';

const ARROW_SIZE = 10;
const NODE_SIZE = 40;
const FONT_SIZE_DEFAULT = 12;
const OPACITY_NO_SELECTED_ITEM = 0.2;

const ALPHA_FORCE = 0.1;
const ALPHA_MIN_FORCE = 0.065;
const ALPHA_TARGET_DRAG = 0.3;
export default class Graph {
    $root: HTMLElement;
    nodes: GraphNode[];
    links: GraphEdge[] | GraphEdgeModifiedByForce[];
    width: number;
    height: number;
    force: Simulation<GraphNode, GraphEdgeModifiedByForce>;
    svgContainer: Selection<SVGSVGElement, GraphNode, null, undefined>;
    svgContainerGroupNodes: Selection<SVGGElement, GraphNode, null, undefined>;
    isDraggingNode: boolean;
    handleZoom: ZoomBehavior<SVGSVGElement, GraphNode>;
    valueline: Line<[number, number]>;
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
        this.width = boxWidth;
        this.height = boxHeight;
        this.options = options;

        this.EventEmitter = new EventEmitter();
        this.isDraggingNode = false;
        this.isGraphLoaded = false;

        this.force = this.initForce(this.nodes);

        this.svgContainer = this.createSvgContainer();
        this.svgContainerGroupNodes = this.svgContainer
            .append('g')
            .attr('width', '100%')
            .attr('height', '100%');

        (this.valueline = line()
            .x(function (d) {
                return d[0];
            })
            .y(function (d) {
                return d[1];
            })
            .curve(curveCardinalClosed)),
            (this.groupIds = []);

        this.handleZoom = zoom<SVGSVGElement, GraphNode>()
            .scaleExtent([0.5, 4])
            .on('zoom', ({ transform }) => {
                this.svgContainerGroupNodes.attr('transform', transform);
            });

        this.svgContainer.call(this.handleZoom);
        this.redrawTopology(this.nodes, this.links);
    }

    private createSvgContainer() {
        return select<HTMLElement, GraphNode>(this.$root)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%');
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
        this.svgContainerGroupNodes.selectAll<SVGSVGElement, GraphNode>('.node').attr(
            'transform',
            ({ x, y }) => `translate(
                    ${x},
                    ${y}
                )`,
        );

        this.svgContainerGroupNodes
            .selectAll<SVGSVGElement, GraphEdgeModifiedByForce>('.serviceLink')
            .attr('x1', ({ source }) => source.x)
            .attr('y1', ({ source }) => source.y)
            .attr('x2', ({ target }) => target.x)
            .attr('y2', ({ target }) => target.y);

        if (this.options?.showGroup) {
            this.redrawGroups();
        }
    };

    private polygonGenerator = (groupId: string) => {
        const node_coords: [number, number][] = this.svgContainerGroupNodes
            .selectAll<SVGSVGElement, GraphNode>('.node')
            .filter(function ({ group }) {
                return group === Number(groupId);
            })
            .data()
            .map(function ({ x, y }) {
                return [x, y];
            });

        if (node_coords.length < 3) {
            // When the number of the nodes is less than 3, we need to create fake points x,y to create a polygon. At least 3.
            node_coords.push([node_coords[0][0] + NODE_SIZE, node_coords[0][1]]);
            node_coords.push([node_coords[0][0] - NODE_SIZE, node_coords[0][1]]);
            node_coords.push([node_coords[0][0], node_coords[0][1] + NODE_SIZE]);
            node_coords.push([node_coords[0][0], node_coords[0][1] - NODE_SIZE]);
        }

        return polygonHull(node_coords);
    };

    private redrawGroups() {
        this.groupIds.forEach((groupId) => {
            let centroid: [number, number] = [0, 0];

            const path = this.svgContainerGroupNodes
                .selectAll<SVGPathElement, string>('.nodes_groups')
                .filter((id) => id === groupId)
                .attr('transform', 'scale(1) translate(0,0)')
                .attr('d', (id) => {
                    const polygon = this.polygonGenerator(id);
                    centroid = polygon ? polygonCentroid(polygon) : [0, 0];

                    return this.valueline(
                        (polygon || [])?.map(function (point) {
                            return [point[0] - centroid[0] || 0, point[1] - centroid[1] || 0];
                        }),
                    );
                });

            const $parentNode = path.node()?.parentNode as HTMLElement | null;

            select($parentNode).attr(
                'transform',
                `translate(${centroid[0]},${centroid[1]}) scale(${1.5})`,
            );
        });
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
            .force('charge', forceManyBody())
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
                forceLink<GraphNode, GraphEdgeModifiedByForce>().id(({ id }) => id),
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

    private updateEdges = () => {
        const edges = this.links as GraphEdgeModifiedByForce[];
        // Pointer
        this.svgContainerGroupNodes
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
        // links services
        const svgEdgesData = this.svgContainerGroupNodes.selectAll('.serviceLink').data(edges);
        const svgEdges = svgEdgesData.enter();

        svgEdges
            .append('line')
            .attr('id', ({ source, target }) => `edge${source.id}-${target.id}`)
            .attr('class', 'serviceLink')
            .attr('marker-end', 'url(#arrow)');

        this.redrawEdges();
    };

    private redrawEdges() {
        const node = this.selectedNode || this.nodeInitialized;
        this.svgContainerGroupNodes
            .selectAll<SVGElement, GraphEdgeModifiedByForce>('.serviceLink')
            .style('stroke-width', '1px')
            .style('stroke-dasharray', ({ type, source, target }) =>
                type === 'dashed' || node === source.id || node === target.id ? '8,8' : '0,0',
            )
            .style('stroke', ({ source, target, isActive }) => {
                const isEdgeConnectedToTheNode = node && (node === source.id || node === target.id);

                const isConnected = isEdgeConnectedToTheNode
                    ? 'var(--pf-global--palette--blue-400)'
                    : 'var(--pf-global--palette--black-400)';

                return isActive ? 'var(--pf-global--palette--red-100)' : isConnected;
            })
            .style('opacity', ({ source, target }) => {
                const isEdgeConnectedToTheNode = !node || node === source.id || node === target.id;

                return isEdgeConnectedToTheNode ? '1' : OPACITY_NO_SELECTED_ITEM;
            })
            .each((svgLink) => {
                const isLinkConnectedToTheNode =
                    node === svgLink.source.id || node === svgLink.target.id;

                if (!this.selectedNode && isLinkConnectedToTheNode) {
                    addAnimateEdges(svgLink);
                }
            })
            .on('click', (_, nodeSelected) => {
                this.EventEmitter.emit(GraphEvents.EdgeClick, [
                    {
                        type: 'click',
                        name: GraphEvents.EdgeClick,
                        data: { ...nodeSelected, id: this.selectedNode },
                    },
                ]);
            });
    }

    private redrawGroupNodes = () => {
        const nodes = this.nodes;

        this.groupIds = set(nodes.map((n) => +n.group))
            .values()
            .map((groupId) => ({
                groupId,
                count: nodes.filter((n) => n.group === Number(groupId)).length,
            }))
            .filter((group) => group.count > 0)
            .map((group) => group.groupId);

        this.svgContainerGroupNodes
            .attr('class', 'groups')
            .selectAll('.path_placeholder')
            .data(this.groupIds)
            .enter()
            .append('g')
            .attr('class', 'path_placeholder')
            .append('path')
            .attr('class', 'nodes_groups')
            .attr('fill', (groupId) => colors[Number(groupId)])
            .attr('opacity', 0.15)
            .style('cursor', 'pointer')
            .call(
                drag<SVGPathElement, string>()
                    .on('start', this.groupDragStarted)
                    .on('drag', this.groupDragged)
                    .on('end', this.groupDragEnded),
            );
    };

    private redrawNodes = () => {
        const nodes = this.nodes;

        const svgNodesData = this.svgContainerGroupNodes.selectAll('.node').data(nodes);
        const svgNodes = svgNodesData.enter();
        const enterSelection = svgNodes.append('g').attr('class', 'node');
        enterSelection
            .append('circle')
            .attr('class', 'node-img')
            .attr('r', NODE_SIZE / 2)
            .style('fill', ({ color }) => color);

        enterSelection
            .append('image')
            .attr('xlink:href', ({ img }) => img || null)
            .attr('class', 'node-img')
            .attr('width', NODE_SIZE / 2)
            .attr('x', -NODE_SIZE / 4)
            .attr('y', -NODE_SIZE / 2)
            .attr('height', NODE_SIZE)
            .style('fill', 'white');

        // it improves drag & drop area selection
        enterSelection
            .append('circle')
            .attr('r', NODE_SIZE / 2)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer')
            .on('mouseover', (_, { id }) => {
                this.nodeInitialized = null;

                if (!this.isDraggingNode && !this.selectedNode) {
                    this.svgContainerGroupNodes
                        .selectAll<SVGElement, GraphEdgeModifiedByForce>('.serviceLink')
                        .each((svgLink) => {
                            const isLinkConnectedToTheNode =
                                id === svgLink.source.id || id === svgLink.target.id;

                            if (!this.selectedNode && isLinkConnectedToTheNode) {
                                addAnimateEdges(svgLink);
                            }
                        })
                        .style('opacity', (svgLink) => {
                            const isLinkConnectedToTheNode =
                                id === svgLink.source.id || id === svgLink.target.id;

                            return isLinkConnectedToTheNode ? '1' : OPACITY_NO_SELECTED_ITEM;
                        })
                        .style('stroke', (svgLink) => {
                            const isLinkConnectedToTheNode =
                                id === svgLink.source.id || id === svgLink.target.id;

                            return isLinkConnectedToTheNode
                                ? 'var(--pf-global--palette--blue-400)'
                                : 'var(--pf-global--palette--black-400)';
                        });
                }
            })
            .on('mouseout', () => {
                if (!this.isDraggingNode && !this.selectedNode) {
                    this.svgContainerGroupNodes
                        .selectAll<SVGSVGElement, GraphEdgeModifiedByForce>('.serviceLink')
                        .each(stopAnimateEdges);
                }
                this.redrawEdges();
            })
            .on('dblclick', (e) => e.stopPropagation()) // deactivates the zoom triggered by d3-zoom
            .on('click', (_, node) => {
                if (node.isDisabled) {
                    return;
                }

                const id = node.id;
                if (this.selectedNode === id) {
                    this.selectedNode = null;
                } else {
                    this.selectedNode = id;
                }

                this.redrawNodesOpacity();
                this.EventEmitter.emit(GraphEvents.NodeClick, [
                    {
                        type: 'click',
                        name: GraphEvents.NodeClick,
                        data: { ...node, id: this.selectedNode },
                    },
                ]);

                this.svgContainerGroupNodes
                    .selectAll<SVGElement, GraphEdgeModifiedByForce>('.serviceLink')
                    .each((svgLink) => {
                        const isLinkConnectedToTheNode =
                            id === svgLink.source.id || id === svgLink.target.id;

                        if (this.selectedNode && isLinkConnectedToTheNode) {
                            addAnimateEdges(svgLink);
                        } else {
                            stopAnimateEdges(svgLink);
                        }
                    });
                this.redrawEdges();
            });

        enterSelection
            .append('text')
            .attr('class', 'node-img')
            .attr('font-size', FONT_SIZE_DEFAULT)
            .attr('y', NODE_SIZE / 2 + FONT_SIZE_DEFAULT)
            .style('fill', 'var(--pf-global--palette--black-500)')
            .text(({ name }) => name);

        enterSelection.call(
            drag<SVGGElement, GraphNode>()
                .on('start', this.dragStarted)
                .on('drag', this.dragged)
                .on('end', this.dragEnded),
        );

        this.redrawNodesOpacity();
    };

    private redrawNodesOpacity() {
        this.svgContainerGroupNodes
            .selectAll<SVGSVGElement, GraphNode>('.node-img')
            .style('opacity', ({ id, isDisabled }) => {
                if ((!!this.selectedNode && id !== this.selectedNode) || isDisabled) {
                    return OPACITY_NO_SELECTED_ITEM;
                }

                return '1';
            });
    }

    private redrawTopology = (nodes: GraphNode[], edges: GraphEdge[]) => {
        this.svgContainerGroupNodes.selectAll('*').remove();
        this.links = JSON.parse(JSON.stringify(edges));
        this.nodes = JSON.parse(JSON.stringify(nodes));

        this.force.nodes(this.nodes).on('tick', this.ticked);
        this.force
            .force<ForceLink<GraphNode, GraphEdge | GraphEdgeModifiedByForce>>('link')
            ?.links(this.links);

        this.force.restart();

        this.redrawGroupNodes();
        this.updateEdges();
        this.redrawNodes();
    };

    updateTopology = (nodes: GraphNode[], edges: GraphEdge[], options?: { showGroup: boolean }) => {
        if (this.isGraphLoaded && !this.isDraggingNode) {
            this.options = { ...this.options, showGroup: !!options?.showGroup };
            this.redrawTopology(nodes, edges);
        }
    };

    // exposed events
    zoomReset() {
        const $parent = this.svgContainer.node() as SVGElement;

        this.svgContainer
            .transition()
            .duration(750)
            .call(
                this.handleZoom.transform,
                zoomIdentity,
                zoomTransform($parent).invert([this.width / 2, this.height / 2]),
            );
    }

    zoomIn() {
        return this.svgContainer.transition().duration(750).call(this.handleZoom.scaleBy, 1.5);
    }

    zoomOut() {
        return this.svgContainer.transition().duration(750).call(this.handleZoom.scaleBy, 0.5);
    }

    deselectAll() {
        this.selectedNode = null;
        this.redrawGroupNodes();
        this.updateEdges();
        this.redrawNodes();
        this.svgContainerGroupNodes
            .selectAll<SVGSVGElement, GraphEdgeModifiedByForce>('.serviceLink')
            .each(stopAnimateEdges);
    }
}

function addAnimateEdges({ source, target }: GraphEdgeModifiedByForce) {
    select<SVGSVGElement, GraphEdgeModifiedByForce>(`#edge${source.id}-${target.id}`)
        .style('stroke-dasharray', '8, 8')
        .transition()
        .duration(750)
        .ease(easeLinear)
        .styleTween('stroke-dashoffset', () => interpolate('30', '0'))
        .on('end', addAnimateEdges);
}

function stopAnimateEdges({ source, target }: GraphEdgeModifiedByForce) {
    select(`#edge${source.id}-${target.id}`).transition().on('end', null);
}
