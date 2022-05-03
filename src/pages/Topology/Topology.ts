import { drag } from 'd3-drag';
import { xml } from 'd3-fetch';
import {
    forceSimulation,
    forceCenter,
    forceManyBody,
    forceCollide,
    forceLink,
    forceX,
    forceY,
} from 'd3-force';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import { zoom, zoomTransform, zoomIdentity } from 'd3-zoom';

import server from '@assets/server.svg';
import service from '@assets/service.svg';

import {
    DeploymentsNode,
    DeploymentTopologyNode,
    SitesTopologyLink,
    SitesTopologyLinkNormalized,
    // SiteTopologyNode,
} from './Topology.interfaces';

const SITE_SIZE = 150;
const ARROW_SIZE = 10;
const SERVICE_SIZE = 40;

// const tooltip = select('body')
//     .append('div')
//     .style('position', 'absolute')
//     .style('z-index', '1000')
//     .style('visibility', 'hidden')
//     .style('background-color', 'var(--pf-global--palette--black-200)')
//     .style('border', 'solid')
//     .style('border-width', '1px')
//     .style('border-radius', '4px')
//     .style('border-color', 'var(--pf-global--palette--light-blue-500)')
//     .style('padding', '10px')
//     .style('opacity', '0.7')
//     .html('');

const TopologySites = function (
    $node: HTMLElement,
    nodes: DeploymentsNode[],
    links: SitesTopologyLink[],
    boxWidth: number,
    boxHeight: number,
) {
    if (!nodes.length) {
        return null;
    }

    //const sites = nodes.filter(({ type }) => type === 'site');
    const services = nodes; //nodes.filter(({ type }) => type === 'service');
    //const linkSites = links.filter(({ type }) => type === 'linkSite');
    const linkServices = links; //links.filter(({ type }) => type === 'linkService');

    const domain = services.reduce((acc, node) => {
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

    //  const isDragging = false;

    const simulation = forceSimulation(services)
        .force(
            'x',
            forceX()
                .strength(0.3)
                .x(function (d: any) {
                    return xScale(d.group?.toString()) as number;
                }),
        )
        .force(
            'y',
            forceY()
                .strength(0.3)
                .y(function (d: any) {
                    return yScale(d.group?.toString()) as number;
                }),
        )
        .force('center', forceCenter((boxWidth || 2) / 2, (boxHeight || 2) / 2).strength(0))
        .force('charge', forceManyBody().strength(0))
        .force('collide', forceCollide().strength(1).radius(SERVICE_SIZE).iterations(1))
        .force(
            'link',
            forceLink<DeploymentsNode, SitesTopologyLink>()
                .strength(0.15)
                .id(function ({ id }) {
                    return id;
                }),
        );

    simulation.nodes(services).on('tick', ticked).force<any>('link').links(linkServices);

    const groupMap: any = {};
    services.forEach(function (v, i) {
        const g = v.group;
        if (typeof groupMap[g] === 'undefined') {
            groupMap[g] = [];
        }
        groupMap[g].push(i);

        // v.width = v.height = 10;
    });

    const groups: any = [];
    // eslint-disable-next-line guard-for-in
    for (const g in groupMap) {
        groups.push({ id: g, leaves: groupMap[g] });
    }
    console.log(groups);
    // const simulationSite = forceSimulation(sites)
    //     .force(
    //         'x',
    //         forceX()
    //             .strength(0.5)
    //             .x(function (d: any) {
    //                 return xScale(d.group?.toString()) as number;
    //             }),
    //     )
    //     .force(
    //         'y',
    //         forceY()
    //             .strength(0.5)
    //             .y(function (d: any) {
    //                 return yScale(d.group?.toString()) as number;
    //             }),
    //     )
    //     .force('center', forceCenter((boxWidth || 2) / 2, (boxHeight || 2) / 2))
    //     .force('charge', forceManyBody().strength(1))
    //     .force('collide', forceCollide().strength(0.1).radius(32).iterations(1))
    //     .force('link', forceLink<DeploymentsNode, SitesTopologyLink>().strength(0.15));

    // simulationSite.nodes(sites).on('tick', ticked).force<any>('link').links(linkSites);

    // links.some(function ({ source, target, sourceId, targetId, ...rest }) {
    //     services.some(function (node) {
    //         if (sourceId === node.id) {
    //             linksWithNodes.push({ ...rest, target, source: node });
    //         }
    //         if (targetId === node.id) {
    //             linksWithNodes.push({ ...rest, source, target: node });
    //         }
    //     });
    // });

    // root
    const svgContainer = select($node)
        .append('svg')
        .attr('id', 'topology-draw-panel')
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .style('background-color', 'var(--pf-global--BackgroundColor--100)');

    const svgElement = svgContainer.append('g').attr('width', boxWidth).attr('height', boxHeight);

    // arrow site
    svgElement
        .append('svg:defs')
        .append('svg:marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', SITE_SIZE * 2)
        .attr('refY', 0)
        .attr('markerWidth', ARROW_SIZE)
        .attr('markerHeight', ARROW_SIZE)
        .attr('orient', 'auto-start-reverse')
        .append('svg:path')
        .style('fill', 'gray')
        .attr('d', 'M0,-5L10,0L0,5');

    // arrow service
    svgElement
        .append('svg:defs')
        .append('svg:marker')
        .attr('id', 'arrowService')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', SERVICE_SIZE / 2 + ARROW_SIZE)
        .attr('refY', 0)
        .attr('markerWidth', ARROW_SIZE)
        .attr('markerHeight', ARROW_SIZE)
        .attr('orient', 'auto-start-reverse')
        .append('svg:path')
        .style('fill', 'gray')
        .attr('d', 'M0,-5L10,0L0,5');

    // // links
    // svgElement
    //     .selectAll('.siteLink')
    //     .data(linkSites)
    //     .enter()
    //     .call(function (p) {
    //         // hidden link line. Creates an area  to trigger mouseover and show the popup
    //         p.append('line')
    //             .attr('class', 'siteLink')
    //             .style('stroke', 'transparent')
    //             .style('stroke-width', '24px')
    //             .style('opacity', 0);

    //         p.append('line')
    //             .attr('class', 'siteLink')
    //             .style('stroke', 'var(--pf-global--palette--black-400)')
    //             .style('stroke-width', '1px')
    //             .attr('marker-end', 'url(#arrow)');
    //     });

    // //sites
    // const svgSiteNodes = svgElement
    //     .selectAll('.siteNode')
    //     .data(sites)
    //     .enter()
    //     .call(function (p) {
    //         p.append('rect')
    //             .attr('class', 'siteNode')
    //             .attr('width', SITE_SIZE)
    //             .attr('height', SITE_SIZE)
    //             .style('stroke', 'steelblue')
    //             .style('stroke-width', '1px')
    //             .style('fill', () => 'var(--pf-global--BackgroundColor--100)')
    //             .call(
    //                 drag<SVGRectElement, DeploymentsNode>()
    //                     .on('start', dragStarted)
    //                     .on('drag', dragged)
    //                     .on('end', dragEnded),
    //             );

    //         p.append('text')
    //             .attr('class', 'siteNodeL')
    //             .attr('font-size', 18)
    //             .style('text-anchor', 'middle')
    //             .style('fill', 'var(--pf-global--palette--light-blue-500)')
    //             .text(function ({ name }) {
    //                 return name;
    //             });
    //   });

    // links services
    svgElement
        .selectAll('.serviceLink')
        .data(linkServices)
        .enter()
        .call(function (p) {
            // hidden link line. Creates an area  to trigger mouseover and show the popup
            // p.append('line')
            //     .attr('class', 'serviceLink')
            //     .style('stroke', 'transparent')
            //     .style('stroke-width', '24px')
            //     .style('opacity', 0);

            p.append('line')
                .attr('class', 'serviceLink')
                .style('stroke', 'var(--pf-global--palette--black-400)')
                .style('stroke-width', '1px')
                .attr('marker-end', 'url(#arrowService)');
        });

    //services
    const svgServiceNodes = svgElement.selectAll('.serviceNode').data(services).enter();
    xml(server).then((serverXMLData) => {
        xml(service).then((serviceXMLData) => {
            svgServiceNodes.call(function (p) {
                p.append('text')
                    .attr('class', 'serviceNodeL')
                    .attr('font-size', 12)
                    .style('text-anchor', 'middle')
                    .style('fill', 'var(--pf-global--palette--light-blue-500)')
                    .text(function ({ name }) {
                        return name;
                    });

                p.append(function ({ type }) {
                    const XMLData = type === 'site' ? serverXMLData : serviceXMLData;

                    return XMLData.documentElement.cloneNode(true) as any;
                })
                    .attr('width', SERVICE_SIZE)
                    .attr('height', SERVICE_SIZE)
                    .attr('class', 'serviceNode')
                    .style('fill', function (d: any) {
                        return color(d.group) as any;
                    })
                    .call(
                        drag<any, any>()
                            .on('start', dragStarted)
                            .on('drag', dragged)
                            .on('end', dragEnded),
                    )
                    .on('mouseover', function (_, d) {
                        svgElement.selectAll('.serviceLink').style('opacity', function (l: any) {
                            console.log(l.sourceId, l.targetId);
                            if (
                                d.id === l.source.id ||
                                d.id === l.target.id ||
                                d.id === l.sourceId ||
                                d.id === l.targetId
                            ) {
                                return '1';
                            }

                            return '0';
                        });
                    })
                    .on('mouseout', function () {
                        svgElement.selectAll('.serviceLink').style('opacity', '1');
                    });
            });
        });
    });
    // drag util

    function fixNodes(node: any) {
        svgServiceNodes.each(function (d: any) {
            if (node !== d) {
                d.fx = d.x;
                d.fy = d.y;
            }
        });

        // svgSiteNodes.each(function (d: any) {
        //     if (node !== d) {
        //         d.fx = d.x;
        //         d.fy = d.y;
        //     }
        // });
    }

    function dragStarted(event: any, node: DeploymentsNode) {
        if (!event.active) {
            simulation.alphaTarget(0.3).restart();
            //simulationSite.alphaTarget(0.3).restart();
        }
        node.fx = node.x;
        node.fy = node.y;

        fixNodes(node);
        // isDragging = true;
    }

    function dragged(event: any, node: DeploymentsNode) {
        node.fx = event.x;
        node.fy = event.y;
    }

    function dragEnded(event: any, node: DeploymentsNode) {
        if (!event.active) {
            simulation.alphaTarget(0);
            simulation.stop();

            // simulationSite.alphaTarget(0);
            // simulationSite.stop();
        }
        node.fx = null;
        node.fy = null;

        //isDragging = false;
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
            .selectAll<SVGSVGElement, DeploymentTopologyNode>('.serviceNode')
            .attr('x', ({ x }) => validatePosition(x - SERVICE_SIZE / 2, maxSvgPosX, minSvgPosX))
            .attr('y', ({ y }) => validatePosition(y - SERVICE_SIZE / 2, maxSvgPosY, minSvgPosY));

        svgElement
            .selectAll<SVGSVGElement, DeploymentTopologyNode>('.serviceNodeL')
            .attr('x', ({ x }) => validatePosition(x, maxSvgPosX, minSvgPosX))
            .attr('y', ({ y }) => validatePosition(y - SERVICE_SIZE * 1.2, maxSvgPosY, minSvgPosY));

        svgElement
            .selectAll<SVGSVGElement, SitesTopologyLinkNormalized>('.serviceLink')
            .attr('x1', ({ source }) => validatePosition(source.x, maxSvgPosX, minSvgPosX))
            .attr('y1', ({ source }) => validatePosition(source.y, maxSvgPosX, minSvgPosX))
            .attr('x2', ({ target }) => validatePosition(target.x, maxSvgPosX, minSvgPosX))
            .attr('y2', ({ target }) => validatePosition(target.y, maxSvgPosX, minSvgPosX));

        // svgElement
        //     .selectAll<SVGSVGElement, SiteTopologyNode>('.siteNode')
        //     .attr('x', ({ x }) => validatePosition(x - SITE_SIZE / 2, maxSvgPosX, minSvgPosX))
        //     .attr('y', ({ y }) => validatePosition(y - SITE_SIZE / 2, maxSvgPosY, minSvgPosY));

        // svgElement
        //     .selectAll<SVGSVGElement, SiteTopologyNode>('.siteNodeL')
        //     .attr('x', ({ x }) => validatePosition(x, maxSvgPosX, minSvgPosX))
        //     .attr('y', ({ y }) => validatePosition(y - SITE_SIZE / 2 - 10, maxSvgPosY, minSvgPosY));

        // svgElement
        //     .selectAll<SVGSVGElement, SitesTopologyLinkNormalized>('.siteLink')
        //     .attr('x1', ({ source }) => validatePosition(source.x, maxSvgPosX, minSvgPosX))
        //     .attr('y1', ({ source }) => validatePosition(source.y, maxSvgPosX, minSvgPosX))
        //     .attr('x2', ({ target }) => validatePosition(target.x, maxSvgPosX, minSvgPosX))
        //     .attr('y2', ({ target }) => validatePosition(target.y, maxSvgPosX, minSvgPosX));
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
};

export default TopologySites;
