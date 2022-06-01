import { drag } from 'd3-drag';
import { xml } from 'd3-fetch';
import { forceSimulation, forceCenter, forceManyBody, forceLink, forceX, forceY } from 'd3-force';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { zoom, zoomTransform, zoomIdentity } from 'd3-zoom';

import server from '@assets/server.svg';
import service from '@assets/service.svg';

import { TopologyNode, TopologyLink, TopologyLinkNormalized } from './Topology.interfaces';

const SITE_SIZE = 150;
const ARROW_SIZE = 10;
const SERVICE_SIZE = 40;

const TopologyGraph = async function (
    $node: HTMLElement,
    nodes: TopologyNode[],
    links: TopologyLink[],
    boxWidth: number,
    boxHeight: number,
    onClick: Function,
) {
    if (!nodes.length) {
        return null;
    }

    const domain = nodes.reduce((acc, node) => {
        acc[node.group] = true;

        return acc;
    }, {} as Record<string, boolean>);

    const domainValues = Object.keys(domain);
    const rangeValuesX = domainValues.map((_, i) => (i ? (boxWidth - 100) / i : 100));
    const rangeValuesY = domainValues.map((_, i) =>
        i ? (boxHeight / domainValues.length) * i : 100,
    );

    const xScale = scaleOrdinal().domain(domainValues).range(rangeValuesX);
    const yScale = scaleOrdinal().domain(domainValues).range(rangeValuesY);
    const color = scaleOrdinal(schemeCategory10).domain(domainValues);

    // let isDragging = false;
    const simulation = forceSimulation<TopologyNode, TopologyLinkNormalized>(nodes)
        .force('center', forceCenter((boxWidth || 2) / 2, (boxHeight || 2) / 2).strength(0))
        .force('charge', forceManyBody())
        .force(
            'x',
            forceX<TopologyNode>()
                .strength(0.3)
                .x(function ({ group, fx }) {
                    if (fx) {
                        return fx;
                    }

                    return xScale(group?.toString()) as number;
                }),
        )
        .force(
            'y',
            forceY<TopologyNode>()
                .strength(0.3)
                .y(function ({ group, fy }) {
                    if (fy) {
                        return fy;
                    }

                    return yScale(group?.toString()) as number;
                }),
        )
        .force(
            'link',
            forceLink<TopologyNode, TopologyLink>(links).id(({ id }) => id),
        )
        .on('tick', ticked);

    // root
    const svgContainer = select($node)
        .append('svg')
        .attr('id', 'topology-draw-panel')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${boxWidth} ${boxHeight}`)
        .attr('width', '100%')
        .attr('height', '100%')
        .style('background-color', 'var(--pf-global--BackgroundColor--100)');

    const svgElement = svgContainer.append('g').attr('width', '100%').attr('height', '100%');

    // arrow service
    svgElement
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
    const svgLinks = svgElement.selectAll('.serviceLink').data(links).enter();

    svgLinks
        .append('line')
        .attr('class', 'serviceLink')
        .style('stroke', 'var(--pf-global--palette--black-400)')
        .style('stroke-width', '1px')
        .attr('marker-end', ({ type }) =>
            type === 'service' || type === 'site' ? 'none' : 'url(#arrow)',
        );

    //services
    const serverXMLData = await xml(server);
    const serviceXMLData = await xml(service);
    const svgServiceNodes = svgElement.selectAll('.serviceNode').data(nodes).enter();

    svgServiceNodes
        .append('text')
        .attr('class', 'serviceNodeL')
        .attr('font-size', 12)
        .style('text-anchor', 'middle')
        .style('fill', 'var(--pf-global--palette--light-blue-500)')
        .text(({ name }) => name);

    svgServiceNodes
        .append(({ type }) => {
            const XMLData = type === 'site' ? serverXMLData : serviceXMLData;

            return XMLData.documentElement.cloneNode(true) as HTMLElement;
        })
        .attr('width', SERVICE_SIZE)
        .attr('height', SERVICE_SIZE)
        .attr('class', 'serviceNode')
        .style('fill', ({ group }) => color(group.toString()));

    // it improves drag & drop area selection
    svgServiceNodes
        .append('rect')
        .attr('class', 'serviceNode')
        .attr('width', SERVICE_SIZE)
        .attr('height', SERVICE_SIZE)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .call(
            drag<SVGRectElement, TopologyNode>()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded),
        )
        .on('mouseover', (_, { id }) => {
            svgElement
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
                        ? 'blue'
                        : 'var(--pf-global--palette--black-400)';
                });
        })
        .on('mouseout', () =>
            svgElement
                .selectAll('.serviceLink')
                .style('opacity', '1')
                .style('stroke', 'var(--pf-global--palette--black-400)'),
        )
        .on('dblclick', (e) => e.stopPropagation()) // deactivates the zoom triggered by d3-zoom
        .on('click', (_, { id }) => onClick(id));

    // drag util
    function fixNodes(x: number, y: number) {
        svgServiceNodes.each(function (node) {
            if (x !== node.x || y !== node.y) {
                node.fx = node.x;
                node.fy = node.y;
            }
        });
    }

    function dragStarted({ active }: { active: boolean }, node: TopologyNode) {
        if (!active) {
            simulation.alphaTarget(0.3).restart();
        }
        node.fx = node.x;
        node.fy = node.y;

        fixNodes(node.x, node.y);
        // isDragging = true;
    }

    function dragged({ x, y }: { x: number; y: number }, node: TopologyNode) {
        node.fx = x;
        node.fy = y;
    }

    function dragEnded({ active }: { active: boolean }, node: TopologyNode) {
        if (!active) {
            simulation.alphaTarget(0);
            simulation.stop();
        }

        localStorage.setItem(node.id, JSON.stringify({ fx: node.x, fy: node.y }));

        node.fx = null;
        node.fy = null;
        // isDragging = false;
    }

    function ticked() {
        const minSvgPosY = 50;
        const minSvgPosX = 50;

        const maxSvgPosX = Number(svgElement.attr('width'));
        const maxSvgPosY = Number(svgElement.attr('height'));

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
            .selectAll<SVGSVGElement, TopologyNode>('.serviceNode')
            .attr('x', ({ x }) => validatePosition(x - SERVICE_SIZE / 2, maxSvgPosX, minSvgPosX))
            .attr('y', ({ y }) => validatePosition(y - SERVICE_SIZE / 2, maxSvgPosY, minSvgPosY));

        svgElement
            .selectAll<SVGSVGElement, TopologyNode>('.serviceNodeL')
            .attr('x', ({ x }) => validatePosition(x, maxSvgPosX, minSvgPosX))
            .attr('y', ({ y }) => validatePosition(y - SERVICE_SIZE * 1.2, maxSvgPosY, minSvgPosY));

        svgElement
            .selectAll<SVGSVGElement, TopologyLinkNormalized>('.serviceLink')
            .attr('x1', ({ source }) => validatePosition(source.x, maxSvgPosX, minSvgPosX))
            .attr('y1', ({ source }) => validatePosition(source.y, maxSvgPosX, minSvgPosX))
            .attr('x2', ({ target }) => validatePosition(target.x, maxSvgPosX, minSvgPosX))
            .attr('y2', ({ target }) => validatePosition(target.y, maxSvgPosX, minSvgPosX));

        svgElement
            .selectAll<SVGSVGElement, TopologyNode>('.siteNode')
            .attr('x', ({ x }) => validatePosition(x - SITE_SIZE / 2, maxSvgPosX, minSvgPosX))
            .attr('y', ({ y }) => validatePosition(y - SITE_SIZE / 2, maxSvgPosY, minSvgPosY));

        svgElement
            .selectAll<SVGSVGElement, TopologyNode>('.siteNodeL')
            .attr('x', ({ x }) => validatePosition(x, maxSvgPosX, minSvgPosX))
            .attr('y', ({ y }) => validatePosition(y - SITE_SIZE / 2 - 10, maxSvgPosY, minSvgPosY));

        svgElement
            .selectAll<SVGSVGElement, TopologyLinkNormalized>('.siteLink')
            .attr('x1', ({ source }) => validatePosition(source.x, maxSvgPosX, minSvgPosX))
            .attr('y1', ({ source }) => validatePosition(source.y, maxSvgPosX, minSvgPosX))
            .attr('x2', ({ target }) => validatePosition(target.x, maxSvgPosX, minSvgPosX))
            .attr('y2', ({ target }) => validatePosition(target.y, maxSvgPosX, minSvgPosX));
    }

    // zoom
    const handleZoom = ({ transform }: { transform: string }) =>
        svgElement.attr('transform', transform);

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
};

export default TopologyGraph;
