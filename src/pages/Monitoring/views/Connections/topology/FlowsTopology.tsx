import { drag } from 'd3-drag';
import { forceSimulation, forceCenter, forceManyBody, forceCollide, forceLink } from 'd3-force';
import { select } from 'd3-selection';
import { zoom, zoomTransform, zoomIdentity } from 'd3-zoom';

import router from '@assets/router.svg';
import { formatTime } from '@core/utils/formatTime';

import {
    MonitoringTopologyDeviceNode,
    MonitoringTopologyLink,
    MonitoringTopologyLinkNormalized,
    MonitoringTopologyNode,
    MonitoringTopologyRouterNode,
} from './topology.interfaces';

const CIRCLE_R = 10;
const ROUTER_IMG_WIDTH = 50;
const ROUTER_IMG_CENTER_X = ROUTER_IMG_WIDTH / 2;

const tooltip = select('body')
    .append('div')
    .style('position', 'absolute')
    .style('z-index', '1000')
    .style('visibility', 'hidden')
    .style('background-color', 'var(--pf-global--palette--black-200)')
    .style('border', 'solid')
    .style('border-width', '1px')
    .style('border-radius', '4px')
    .style('border-color', 'var(--pf-global--palette--light-blue-500)')
    .style('padding', '10px')
    .style('opacity', '0.7')
    .html('');

function TopologyMonitoringService(
    $node: HTMLElement,
    nodes: MonitoringTopologyNode[],
    links: MonitoringTopologyLink[],
    boxWidth: number,
    boxHeight: number,
) {
    if (!nodes.length) {
        return;
    }

    let isDragging = false;

    const simulation = forceSimulation(nodes)
        .force('center', forceCenter((boxWidth || 2) / 2, (boxHeight || 2) / 3))
        .force('charge', forceManyBody().strength(-30))
        .force('collide', forceCollide(0.9).radius(50).iterations(1))
        .force(
            'link',
            forceLink<MonitoringTopologyNode, MonitoringTopologyLink>()
                .strength(({ pType }) => (pType ? 0.015 : 0.001))
                .id(function ({ id }) {
                    return id;
                }),
        )
        .on('tick', ticked);

    const linksWithNodes: MonitoringTopologyLinkNormalized[] = [];
    links.some(function ({ source, target, ...rest }) {
        nodes.some(function (node) {
            if (source === node.id) {
                linksWithNodes.push({ ...rest, target, source: node });
            }
            if (target === node.id) {
                linksWithNodes.push({ ...rest, source, target: node });
            }
        });
    });

    // root
    const svgContainer = select($node)
        .append('svg')
        .attr('id', 'topology-draw-panel')
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .style('background-color', 'var(--pf-global--BackgroundColor--100)');

    const svgElement = svgContainer.append('g').attr('width', boxWidth).attr('height', boxHeight);
    // arrow
    svgElement
        .append('svg:defs')
        .append('svg:marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', ROUTER_IMG_CENTER_X)
        .attr('markerWidth', 9)
        .attr('markerHeight', 9)
        .attr('orient', 'auto-start-reverse')
        .append('svg:path')
        .style('fill', 'gray')
        .attr('d', 'M0,-5L10,0L0,5');

    // links
    svgElement
        .selectAll('.routerLink')
        .data(linksWithNodes)
        .enter()
        .call(function (p) {
            // hidden link line. Creates an area  to trigger mouseover and show the popup
            p.append('line')
                .attr('class', 'routerLink')
                .style('stroke', 'transparent')
                .style('stroke-width', '24px')
                .style('opacity', 0)
                .on('mouseover', (_, { cost, bytes, type, protocol }) => {
                    const trafficType = type === 'CONNECTOR' ? 'outbound' : 'inbound';

                    const template = cost
                        ? `<p>cost: <b>${cost}</b></p>`
                        : `<p>${trafficType} ${protocol}: <b>${bytes}</b></p>`;
                    tooltip.html(template);

                    return tooltip.style('visibility', 'visible');
                })
                .on('mousemove', function ({ pageY, pageX }) {
                    return tooltip.style('top', `${pageY - 10}px`).style('left', `${pageX + 10}px`);
                })
                .on('mouseout', function () {
                    return tooltip.style('visibility', 'hidden');
                });

            p.append('line')
                .attr('class', 'routerLink')
                .style('stroke', 'var(--pf-global--palette--black-400)')
                .style('stroke-width', '1px')
                .attr(
                    'marker-start',
                    ({ type }) => (type === 'LISTENER' || type === 'CONNECTOR') && 'url(#arrow)',
                );

            // label
            p.append('text')
                .attr('class', 'routerLinkL')
                .attr('font-size', 14)
                .attr('font-size', function ({ type }) {
                    return type !== 'CONNECTOR' && type !== 'LISTENER' ? 24 : 10;
                })
                .style('fill', 'var(--pf-global--palette--light-blue-500)')
                .text(function ({ type, cost = 0, bytes = 0 }) {
                    return type !== 'CONNECTOR' && type !== 'LISTENER' ? cost : bytes;
                });
        });

    // routers
    const routerNodes = nodes.filter(
        (node) => node.type !== 'flow',
    ) as MonitoringTopologyRouterNode[];

    svgElement
        .selectAll('.routerImg')
        .data(routerNodes)
        .enter()
        .call(function (p) {
            p.append('image')
                .attr('xlink:href', router)
                .attr('width', ROUTER_IMG_WIDTH)
                .attr('class', 'routerImg')
                .call(
                    drag<SVGImageElement, MonitoringTopologyRouterNode>()
                        .on('start', dragStarted)
                        .on('drag', dragged)
                        .on('end', dragEnded),
                );

            // label
            p.append('text')
                .attr('class', 'routerImg')
                .text(({ name }) => name)
                .attr('font-size', 10);
        });

    // devices
    const deviceNodes = nodes.filter(
        (node) => node.type === 'flow',
    ) as MonitoringTopologyDeviceNode[];

    svgElement
        .selectAll('.devicesImg')
        .data(deviceNodes)
        .enter()
        .call(function (p) {
            p.append('circle')
                .attr('class', 'devicesImg')
                .attr('r', CIRCLE_R)
                .style('stroke', 'steelblue')
                .style('stroke-width', '1px')
                .style('fill', ({ rtype }) =>
                    rtype === 'CONNECTOR'
                        ? 'var(--pf-global--palette--light-blue-500)'
                        : 'var(--pf-global--BackgroundColor--100)',
                )
                .call(
                    drag<SVGCircleElement, MonitoringTopologyDeviceNode>()
                        .on('start', dragStarted)
                        .on('drag', dragged)
                        .on('end', dragEnded),
                )
                .on('mouseover', function (_, { name, protocol, rtype, numFlows, avgLatency }) {
                    tooltip.html(`
          <b>${name}</b>
          <br><br>
          <p>protocol: <b>${protocol}</b></p>
          <p>type: <b>${rtype}</b></p>
          <p>flows: <b>${numFlows}</b></p>
          <p>Avg Latency: <b>${formatTime(avgLatency)}</b></p>
          `);

                    return tooltip.style('visibility', isDragging ? 'hidden' : 'visible');
                })
                .on('mousemove', function (event) {
                    return tooltip
                        .style('top', `${event.pageY - 10}px`)
                        .style('left', `${event.pageX + 10}px`);
                })
                .on('mouseout', function () {
                    return tooltip.style('visibility', 'hidden');
                });
        });

    simulation.nodes(nodes).force<any>('link').links(linksWithNodes);
    // drag util
    function dragStarted(event: any, node: MonitoringTopologyNode) {
        if (!event.active) {
            simulation.alphaTarget(0.3).restart();
        }
        node.fx = node.x;
        node.fy = node.y;

        isDragging = true;
    }

    function dragged(event: any, node: MonitoringTopologyNode) {
        node.fx = event.x;
        node.fy = event.y;
    }

    function dragEnded(event: any, node: MonitoringTopologyNode) {
        if (!event.active) {
            simulation.alphaTarget(0);
            simulation.stop();
        }
        node.fx = null;
        node.fy = null;

        isDragging = false;
    }

    function ticked() {
        const minSvgPosY = 50;
        const minSvgPosX = 50;

        const maxSvgPosX = Number(svgElement.attr('width')) - 50;
        const maxSvgPosY = Number(svgElement.attr('height')) - 50;

        function validatePosition(pos: number, max: number, min: number) {
            if (pos - min < 0) {
                return min;
            }

            if (pos > max) {
                return max;
            }

            return pos;
        }

        svgElement
            .selectAll<SVGSVGElement, MonitoringTopologyNode>('.routerImg')
            .attr('x', ({ x }) => validatePosition(x, maxSvgPosX, minSvgPosX))
            .attr('y', ({ y }) => validatePosition(y, maxSvgPosY, minSvgPosY));

        svgElement
            .selectAll<SVGSVGElement, MonitoringTopologyNode>('.devicesImg')
            .attr('cx', ({ x }) => validatePosition(x, maxSvgPosX, minSvgPosX))
            .attr('cy', ({ y }) => validatePosition(y, maxSvgPosY, minSvgPosY));

        svgElement
            .selectAll<SVGSVGElement, MonitoringTopologyLinkNormalized>('.routerLink')
            .attr('x1', ({ source }) =>
                validatePosition(
                    (source as MonitoringTopologyRouterNode).x + ROUTER_IMG_CENTER_X,
                    maxSvgPosX,
                    minSvgPosX,
                ),
            )
            .attr('y1', ({ source }) =>
                validatePosition(
                    (source as MonitoringTopologyRouterNode).y + ROUTER_IMG_CENTER_X,
                    maxSvgPosY,
                    minSvgPosY,
                ),
            )
            .attr('x2', ({ target, pType }) =>
                validatePosition(
                    !pType
                        ? (target as MonitoringTopologyRouterNode).x + ROUTER_IMG_CENTER_X
                        : (target as MonitoringTopologyRouterNode).x,
                    maxSvgPosX,
                    minSvgPosX,
                ),
            )
            .attr('y2', ({ target, pType }) =>
                validatePosition(
                    !pType
                        ? (target as MonitoringTopologyRouterNode).y + ROUTER_IMG_CENTER_X
                        : (target as MonitoringTopologyRouterNode).y,
                    maxSvgPosY,
                    minSvgPosY,
                ),
            );

        svgElement
            .selectAll<SVGSVGElement, MonitoringTopologyLinkNormalized>('.routerLinkL')
            .attr('x', ({ target: t, source: s }) => {
                const target = t as MonitoringTopologyRouterNode;
                const source = s as MonitoringTopologyRouterNode;

                if (target.x > source.x) {
                    return validatePosition(
                        source.x + (target.x - source.x) / 2 + ROUTER_IMG_CENTER_X,
                        maxSvgPosX,
                        minSvgPosY,
                    );
                }

                return validatePosition(
                    target.x + (source.x - target.x) / 2 + ROUTER_IMG_CENTER_X,
                    maxSvgPosX,
                    minSvgPosX,
                );
            })
            .attr('y', ({ target: t, source: s }) => {
                const target = t as MonitoringTopologyRouterNode;
                const source = s as MonitoringTopologyRouterNode;

                if (target.y > source.y) {
                    return validatePosition(
                        source.y + (target.y - source.y) / 2 + ROUTER_IMG_CENTER_X,
                        maxSvgPosY,
                        minSvgPosY,
                    );
                }

                return validatePosition(
                    target.y + (source.y - target.y) / 2 + ROUTER_IMG_CENTER_X,
                    maxSvgPosY,
                    minSvgPosY,
                );
            });
    }

    // zoom
    const handleZoom = (e: any) => svgElement.attr('transform', e.transform);
    const initZoom = zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 6]).on('zoom', handleZoom);

    svgContainer.call(initZoom);

    function reset() {
        const $parent = svgContainer.node();

        if ($parent) {
            svgContainer
                .transition()
                .duration(750)
                .call(
                    initZoom.transform,
                    zoomIdentity,
                    zoomTransform($parent).invert([boxWidth / 2, boxHeight / 2]),
                );
        }
    }

    return Object.assign(svgContainer.node(), {
        zoomIn: () => svgContainer.transition().duration(750).call(initZoom.scaleBy, 1.5),
        zoomOut: () => svgContainer.transition().duration(750).call(initZoom.scaleBy, 0.5),
        reset,
    });
}

export default TopologyMonitoringService;
