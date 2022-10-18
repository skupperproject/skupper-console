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
import { curveCatmullRomClosed, Line, line } from 'd3-shape';
import { zoom, zoomTransform, zoomIdentity, ZoomBehavior } from 'd3-zoom';

import EventEmitter from '@core/components/Graph/EventEmitter';

import { colors } from '../../../pages/Topology/Topology.constant';
import { GraphEvents } from './Graph.enum';
import { GraphNode, GraphEdge, GraphEdgeModifiedByForce } from './Graph.interfaces';

const ARROW_SIZE = 10;
const NODE_SIZE = 40;
const FONT_SIZE_DEFAULT = 12;
const OPACITY_NO_SELECTED_ITEM = 0.2;

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
    selectedNode: null | string;
    EventEmitter: EventEmitter;

    constructor(
        $node: HTMLElement,
        nodes: GraphNode[],
        edges: GraphEdge[] | GraphEdgeModifiedByForce[],
        boxWidth: number,
        boxHeight: number,
    ) {
        this.$root = $node;
        this.nodes = nodes;
        this.links = edges;
        this.selectedNode = null;
        this.width = boxWidth;
        this.height = boxHeight;

        this.EventEmitter = new EventEmitter();
        this.isDraggingNode = false;
        this.force = this.initForce(nodes);

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
            .curve(curveCatmullRomClosed)),
            (this.groupIds = []);

        this.handleZoom = zoom<SVGSVGElement, GraphNode>()
            .scaleExtent([0.5, 4])
            .on('zoom', ({ transform }) => {
                this.svgContainerGroupNodes.attr('transform', transform);
            });

        this.svgContainer.call(this.handleZoom);
    }

    private createSvgContainer() {
        return select<HTMLElement, GraphNode>(this.$root)
            .append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);
    }

    private fixNodes = (x: number, y: number) => {
        this.nodes.forEach(function (node) {
            if (x !== node.x || y !== node.y) {
                node.fx = node.x;
                node.fy = node.y;
            }
        });
    };

    private dragStarted = ({ active }: { active: boolean }, node: GraphNode) => {
        if (!active) {
            this.force.alphaTarget(0.3).restart();
        }

        node.fx = node.x;
        node.fy = node.y;

        this.fixNodes(node.x, node.y);
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

        localStorage.setItem(node.id, JSON.stringify({ fx: node.x, fy: node.y }));
        this.isDraggingNode = false;
    };

    private groupDragStarted = (
        { x, y, active }: { x: number; y: number; active: boolean },
        groupId: string,
    ) => {
        if (!active) {
            this.force.alphaTarget(0.3).restart();
        }

        this.force
            .nodes()
            .filter(({ group }) => group === Number(groupId))
            .forEach((node) => {
                node.fx = node.fx || 0;
                node.fy = node.fy || 0;
                node.groupFx = x || 0;
                node.groupFy = y || 0;
            });

        this.isDraggingNode = true;
    };

    private groupDragged = ({ x, y }: { x: number; y: number }, groupId: string) => {
        this.force
            .nodes()
            .filter(({ group }) => group === Number(groupId))
            .forEach((node) => {
                node.fx = (node.fx || 0) + x - (node.groupFx || 0);
                node.fy = (node.fy || 0) + y - (node.groupFy || 0);
            });
    };

    private groupDragEnded = ({ active }: { active: boolean }, groupId: string) => {
        if (!active) {
            this.force.alphaTarget(0);
            this.force.stop();
        }

        this.force
            .nodes()
            .filter(({ group }) => group === Number(groupId))
            .forEach((node) => {
                localStorage.setItem(node.id, JSON.stringify({ fx: node.x, fy: node.y }));
            });

        this.isDraggingNode = false;
    };

    private ticked = () => {
        const minSvgPosY = 10;
        const minSvgPosX = 10;

        const maxSvgPosX = Number(this.svgContainerGroupNodes.attr('width'));
        const maxSvgPosY = Number(this.svgContainerGroupNodes.attr('height'));

        function validatePosition(pos: number, max: number, min: number) {
            if (pos - min < 0) {
                return min;
            }

            if (pos > max) {
                return max;
            }

            return pos;
        }

        this.svgContainerGroupNodes.selectAll<SVGSVGElement, GraphNode>('.node').attr(
            'transform',
            ({ x, y }) => `translate(
                    ${validatePosition(x, maxSvgPosX, minSvgPosX)},
                    ${validatePosition(y, maxSvgPosY, minSvgPosY)}
                )`,
        );

        this.svgContainerGroupNodes
            .selectAll<SVGSVGElement, GraphEdgeModifiedByForce>('.serviceLink')
            .attr('x1', ({ source }) => validatePosition(source.x, maxSvgPosX, minSvgPosX))
            .attr('y1', ({ source }) => validatePosition(source.y, maxSvgPosX, minSvgPosX))
            .attr('x2', ({ target }) => validatePosition(target.x, maxSvgPosX, minSvgPosX))
            .attr('y2', ({ target }) => validatePosition(target.y, maxSvgPosX, minSvgPosX));

        this.redrawGroups();
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
            .alpha(0.1)
            .alphaMin(0.065)
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
                    .id(({ id }) => id)
                    .strength(({ source, target }) => {
                        if (source.group === target.group) {
                            return 1;
                        }

                        return 0.1;
                    }),
            )
            .on('end', () => {
                nodes.forEach((node) => {
                    if (!localStorage.getItem(node.id)) {
                        node.fx = node.x;
                        node.fy = node.y;

                        localStorage.setItem(node.id, JSON.stringify({ fx: node.fx, fy: node.fy }));
                    }
                });

                this.EventEmitter.emit(GraphEvents.IsGraphLoaded);
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
        this.svgContainerGroupNodes
            .selectAll<SVGElement, GraphEdgeModifiedByForce>('.serviceLink')
            .style('stroke-width', '1px')
            .style('stroke-dasharray', ({ type, source, target }) =>
                type === 'dashed' ||
                this.selectedNode === source.id ||
                this.selectedNode === target.id
                    ? '8,8'
                    : '0,0',
            )
            .style('stroke', ({ source, target }) => {
                const isEdgeConnectedToTheNode =
                    this.selectedNode &&
                    (this.selectedNode === source.id || this.selectedNode === target.id);

                return isEdgeConnectedToTheNode
                    ? 'var(--pf-global--palette--blue-400)'
                    : 'var(--pf-global--palette--black-400)';
            })
            .style('opacity', ({ source, target }) => {
                const isEdgeConnectedToTheNode =
                    !this.selectedNode ||
                    this.selectedNode === source.id ||
                    this.selectedNode === target.id;

                return isEdgeConnectedToTheNode ? '1' : OPACITY_NO_SELECTED_ITEM;
            });
    }

    private redrawNodes = () => {
        const nodes = this.nodes;

        this.groupIds = set(nodes.map((n) => +n.group))
            .values()
            .map((groupId) => ({
                groupId,
                count: nodes.filter((n) => n.group === Number(groupId)).length,
            }))
            .filter((group) => group.count > 2)
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

        const svgNodesData = this.svgContainerGroupNodes.selectAll('.node').data(nodes);
        const svgNodes = svgNodesData.enter();
        const enterSelection = svgNodes.append('g').attr('class', 'node');
        enterSelection
            .append('circle')
            .attr('class', 'node-img')
            .attr('r', NODE_SIZE / 2)
            .style('fill', ({ color }) => color);

        enterSelection
            .append(({ img }) => img?.documentElement.cloneNode(true) as HTMLElement)
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
            .style('opacity', ({ id }) =>
                !!this.selectedNode && id !== this.selectedNode ? OPACITY_NO_SELECTED_ITEM : '1',
            );
    }

    updateTopology = (nodes: GraphNode[], links: GraphEdge[] | GraphEdgeModifiedByForce[]) => {
        if (!this.isDragging()) {
            this.svgContainerGroupNodes.selectAll('*').remove();

            this.force.nodes(nodes).on('tick', this.ticked);

            this.force
                .force<ForceLink<GraphNode, GraphEdge | GraphEdgeModifiedByForce>>('link')
                ?.links(links);

            this.force.restart();
            this.links = links as GraphEdgeModifiedByForce[];
            this.nodes = nodes;

            this.updateEdges();
            this.redrawNodes();
        }
    };

    // exposed events
    reset() {
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

    isDragging() {
        return this.isDraggingNode;
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
