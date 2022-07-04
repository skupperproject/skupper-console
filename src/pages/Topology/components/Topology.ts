import { set } from 'd3-collection';
import { drag } from 'd3-drag';
import { xml } from 'd3-fetch';
import {
    forceSimulation,
    forceCenter,
    forceLink,
    forceX,
    forceY,
    Simulation,
    ForceLink,
} from 'd3-force';
import { polygonCentroid, polygonHull } from 'd3-polygon';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { select, Selection } from 'd3-selection';
import { curveCatmullRomClosed, Line, line } from 'd3-shape';
import { zoom, zoomTransform, zoomIdentity, ZoomBehavior } from 'd3-zoom';

import server from '@assets/server.svg';
import service from '@assets/service.svg';

import { TopologyNode, TopologyLink, TopologyLinkNormalized } from './Topology.interfaces';

const ARROW_SIZE = 10;
const SERVICE_SIZE = 35;
const FONT_SIZE_DEFAULT = 12;

export default class TopologyGraph {
    $root: HTMLElement;
    nodes: TopologyNode[];
    links: TopologyLink[] | TopologyLinkNormalized[];
    width: number;
    height: number;
    onClickNode: Function;
    force: Simulation<TopologyNode, TopologyLinkNormalized>;
    svgContainer: Selection<SVGSVGElement, unknown, null, undefined>;
    svgContainerGroup: Selection<SVGGElement, unknown, null, undefined>;
    xmlData: { site: XMLDocument | null; service: XMLDocument | null };
    isDraggingNode: boolean;
    handleZoom: ZoomBehavior<SVGSVGElement, unknown>;
    valueline: Line<[number, number]>;
    groupIds: string[];

    constructor(
        $node: HTMLElement,
        nodes: TopologyNode[],
        links: TopologyLink[],
        boxWidth: number,
        boxHeight: number,
        onclick: Function,
    ) {
        this.$root = $node;
        this.nodes = nodes;
        this.links = links;
        this.width = boxWidth;
        this.height = boxHeight;
        this.onClickNode = onclick;

        this.isDraggingNode = false;
        this.force = this.initForce(nodes);

        this.svgContainer = this.createSvgContainer();
        this.svgContainerGroup = this.svgContainer
            .append('g')
            .attr('width', '100%')
            .attr('height', '100%');

        this.xmlData = { site: null, service: null };

        (this.valueline = line()
            .x(function (d) {
                return d[0];
            })
            .y(function (d) {
                return d[1];
            })
            .curve(curveCatmullRomClosed)),
            (this.groupIds = []);

        this.handleZoom = zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 4])
            .on('zoom', ({ transform }) => {
                this.svgContainerGroup.attr('transform', transform);
            });

        this.svgContainer.call(this.handleZoom);
    }

    private createSvgContainer() {
        return select(this.$root)
            .append('svg')
            .attr('id', 'topology-draw-panel')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('width', '100%')
            .attr('height', '100%')
            .style('background-color', 'var(--pf-global--BackgroundColor--100)');
    }

    private fixNodes = (x: number, y: number) => {
        this.nodes.forEach(function (node) {
            if (x !== node.x || y !== node.y) {
                node.fx = node.x;
                node.fy = node.y;
            }
        });
    };

    private dragStarted = ({ active }: { active: boolean }, node: TopologyNode) => {
        if (!active) {
            this.force.alphaTarget(0.3).restart();
        }
        node.fx = node.x;
        node.fy = node.y;

        this.fixNodes(node.x, node.y);
        this.isDraggingNode = true;
    };

    private dragged = ({ x, y }: { x: number; y: number }, node: TopologyNode) => {
        node.fx = x;
        node.fy = y;
    };

    private dragEnded = ({ active }: { active: boolean }, node: TopologyNode) => {
        if (!active) {
            this.force.alphaTarget(0);
            this.force.stop();
        }

        localStorage.setItem(node.id, JSON.stringify({ fx: node.x, fy: node.y }));
        this.isDraggingNode = false;
    };

    private groupDragstarted = (
        { x, y, active }: { x: number; y: number; active: boolean },
        groupId: string,
    ) => {
        if (!active) {
            this.force.alphaTarget(0.3).restart();
        }

        this.force
            .nodes()
            .filter(({ group }) => group === Number(groupId))
            .forEach((node: TopologyNode) => {
                node.fx = (node.fx || 0) + x;
                node.fy = (node.fy || 0) + y;
            });

        this.isDraggingNode = true;
    };

    private groupDragged = ({ x, y }: { x: number; y: number }, groupId: string) => {
        this.force
            .nodes()
            .filter(({ group }) => group === Number(groupId))
            .forEach((node: TopologyNode) => {
                node.fx = (node.fx || 0) + x;
                node.fy = (node.fy || 0) + y;
            });
    };

    private groupDragended = ({ active }: { active: boolean }, groupId: string) => {
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

        const maxSvgPosX = Number(this.svgContainerGroup.attr('width'));
        const maxSvgPosY = Number(this.svgContainerGroup.attr('height'));

        function validatePosition(pos: number, max: number, min: number) {
            if (pos - min < 0) {
                return min;
            }

            if (pos > max) {
                return max;
            }

            return pos;
        }

        this.svgContainerGroup.selectAll<SVGSVGElement, TopologyNode>('.node').attr(
            'transform',
            ({ x, y }) => `translate(
                    ${validatePosition(x - SERVICE_SIZE / 2, maxSvgPosX, minSvgPosX)},
                    ${validatePosition(y - SERVICE_SIZE / 2, maxSvgPosY, minSvgPosY)}
                )`,
        );

        this.svgContainerGroup
            .selectAll<SVGSVGElement, TopologyLinkNormalized>('.serviceLink')
            .attr('x1', ({ source }) => validatePosition(source.x, maxSvgPosX, minSvgPosX))
            .attr('y1', ({ source }) => validatePosition(source.y, maxSvgPosX, minSvgPosX))
            .attr('x2', ({ target }) => validatePosition(target.x, maxSvgPosX, minSvgPosX))
            .attr('y2', ({ target }) => validatePosition(target.y, maxSvgPosX, minSvgPosX));

        this.updateGroups();
    };

    private polygonGenerator = (groupId: string) => {
        const node_coords: [number, number][] = this.svgContainerGroup
            .selectAll<SVGSVGElement, TopologyNode>('.node')
            .filter(function (d) {
                return d.group === Number(groupId);
            })
            .data()
            .map(function (d) {
                return [d.x, d.y];
            });

        return polygonHull(node_coords);
    };

    private updateGroups() {
        this.groupIds.forEach((groupId) => {
            let centroid: [number, number] = [0, 0];

            const path = this.svgContainerGroup
                .selectAll<SVGPathElement, string>('.nodes_groups')
                .filter((d) => d === groupId)
                .attr('transform', 'scale(1) translate(0,0)')
                .attr('d', (d) => {
                    const polygon = this.polygonGenerator(d);
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

    private initForce(nodes: TopologyNode[]) {
        const domain = nodes.reduce((acc, node) => {
            acc[node.group] = true;

            return acc;
        }, {} as Record<string, boolean>);

        const domainValues = Object.keys(domain);
        const rangeValuesX = domainValues.map((_, i) => (i ? (this.width - SERVICE_SIZE) / i : 0));
        const rangeValuesY = domainValues.map((_, i) =>
            i ? (this.height / domainValues.length) * i : 100,
        );

        const xScale = scaleOrdinal().domain(domainValues).range(rangeValuesX);
        const yScale = scaleOrdinal().domain(domainValues).range(rangeValuesY);

        return forceSimulation<TopologyNode, TopologyLinkNormalized>()
            .force('center', forceCenter(this.width / 2, this.height / 2))
            .force('charge', null)
            .alpha(0.1)
            .force(
                'x',
                forceX<TopologyNode>()
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
                forceY<TopologyNode>()
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
                forceLink<TopologyNode, TopologyLinkNormalized>()
                    .id(({ id }) => id)
                    .strength(({ source, target }) => {
                        if (source.group === target.group) {
                            return 1;
                        }

                        return 0.1;
                    }),
            );
    }

    private updateDOMLinks = (links: TopologyLinkNormalized[]) => {
        // Pointer
        this.svgContainerGroup
            .append('svg:defs')
            .append('svg:marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', SERVICE_SIZE / 2 + ARROW_SIZE)
            .attr('refY', 0)
            .attr('markerWidth', ARROW_SIZE)
            .attr('markerHeight', ARROW_SIZE)
            .attr('orient', 'auto-start-reverse')
            .append('svg:path')
            .style('fill', 'gray')
            .attr('d', 'M0,-5L10,0L0,5');

        // links services
        const svgLinksData = this.svgContainerGroup.selectAll('.serviceLink').data(links);
        const svgLinks = svgLinksData.enter();

        svgLinks
            .append('line')
            .attr('class', 'serviceLink')
            .style('stroke', 'var(--pf-global--palette--black-400)')
            .style('stroke-width', '1px')
            .style('stroke-dasharray', ({ source }) => source.type === 'site' && '8, 8')
            .attr('marker-end', ({ type }) =>
                type === 'service' || type === 'site' ? 'none' : 'url(#arrow)',
            );
    };

    private updateDOMNodes = async (nodes: TopologyNode[]) => {
        this.groupIds = set(nodes.map((n) => +n.group))
            .values()
            .map((groupId) => ({
                groupId,
                count: nodes.filter((n) => n.group === Number(groupId)).length,
            }))
            .filter((group) => group.count > 2)
            .map((group) => group.groupId);
        const setColor = scaleOrdinal(schemeCategory10);

        this.svgContainerGroup
            .attr('class', 'groups')
            .selectAll('.path_placeholder')
            .data(this.groupIds)
            .enter()
            .append('g')
            .attr('class', 'path_placeholder')
            .append('path')
            .attr('class', 'nodes_groups')
            .style('cursor', 'pointer')
            .attr('stroke', (d) => setColor(d))
            .attr('fill', (d) => setColor(d))
            .attr('opacity', 0)
            .on('mouseover', ({ target }) => {
                if (!this.isDraggingNode) {
                    select(target).attr('opacity', 0.15);
                }
            })
            .on('mouseout', ({ target }) => {
                if (!this.isDraggingNode) {
                    select(target).attr('opacity', 0);
                }
            })
            .call(
                drag<SVGPathElement, string>()
                    .on('start', this.groupDragstarted)
                    .on('drag', this.groupDragged)
                    .on('end', this.groupDragended),
            );

        if (!this.xmlData.site) {
            this.xmlData.site = await xml(server);
        }

        if (!this.xmlData.service) {
            this.xmlData.service = await xml(service);
        }

        const svgNodesData = this.svgContainerGroup.selectAll('.node').data(nodes);

        const svgNodes = svgNodesData.enter();

        const enterSelection = svgNodes
            .append('g')
            .attr('class', 'node')
            .call(
                drag<SVGGElement, TopologyNode>()
                    .on('start', this.dragStarted)
                    .on('drag', this.dragged)
                    .on('end', this.dragEnded),
            );

        enterSelection
            .append(({ type }) => {
                const xmlData = type === 'site' ? this.xmlData.site : this.xmlData.service;

                return xmlData?.documentElement.cloneNode(true) as HTMLElement;
            })
            .attr('width', SERVICE_SIZE)
            .attr('height', SERVICE_SIZE)
            .style('fill', ({ color }) => color);

        // it improves drag & drop area selection
        enterSelection
            .append('rect')
            .attr('width', SERVICE_SIZE)
            .attr('height', SERVICE_SIZE)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer')
            .on('mouseover', (_, { id }) => {
                if (!this.isDraggingNode) {
                    this.svgContainerGroup
                        .selectAll<SVGElement, TopologyLinkNormalized>('.serviceLink')
                        .style('opacity', (svgLink) => {
                            const isLinkConnectedToTheNode =
                                id === svgLink.source.id || id === svgLink.target.id;

                            return isLinkConnectedToTheNode ? '1' : '0.2';
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
                if (!this.isDraggingNode) {
                    this.svgContainerGroup
                        .selectAll('.serviceLink')
                        .style('opacity', '1')
                        .style('stroke', 'var(--pf-global--palette--black-400)');
                }
            })
            .on('dblclick', (e) => e.stopPropagation()) // deactivates the zoom triggered by d3-zoom
            .on('click', (_, { id }) => this.onClickNode && this.onClickNode(id));

        enterSelection
            .append('text')
            .attr('font-size', FONT_SIZE_DEFAULT)
            .attr('y', SERVICE_SIZE + FONT_SIZE_DEFAULT * 2)
            .style('fill', 'var(--pf-global--palette--black-500)')
            .text(({ name }) => name);
    };

    updateTopology = (nodes: TopologyNode[], links: TopologyLink[] | TopologyLinkNormalized[]) => {
        this.svgContainerGroup.selectAll('*').remove();

        this.force
            .nodes(nodes)
            .on('tick', this.ticked)
            .on('end', () => {
                nodes.forEach((node) => {
                    if (!localStorage.getItem(node.id)) {
                        node.fx = node.x;
                        node.fy = node.y;

                        localStorage.setItem(node.id, JSON.stringify({ fx: node.fx, fy: node.fy }));
                    }
                });
            });

        this.force
            .force<ForceLink<TopologyNode, TopologyLink | TopologyLinkNormalized>>('link')
            ?.links(links);
        this.force.restart();

        this.updateDOMLinks(links as TopologyLinkNormalized[]);
        this.updateDOMNodes(nodes);
    };

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
