import { drag } from 'd3-drag';
import { forceSimulation, forceCenter, forceManyBody, forceCollide, forceLink } from 'd3-force';
import { select } from 'd3-selection';

import router from '@assets/router.svg';
import { formatTime } from '@utils/formatTime';

import {
  MonitoringTopologyDeviceNode,
  MonitoringTopologyLink,
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
      forceLink()
        .strength(({ pType }: any) => (pType ? 0.015 : 0.001))
        .id(function ({ id }: any) {
          return id;
        }),
    )
    .on('tick', ticked);

  const linksWithNodes: MonitoringTopologyLink[] = [];
  links.some(function (link) {
    nodes.some(function (node) {
      if (link.source === node.id) {
        linksWithNodes.push({ ...link, source: node });
      }
      if (link.target === node.id) {
        linksWithNodes.push({ ...link, target: node });
      }
    });
  });

  // root
  const svgElement = select($node)
    .append('svg')
    .attr('id', 'topology-draw-panel')
    .attr('width', boxWidth)
    .attr('height', boxHeight)
    .style('background-color', 'var(--pf-global--BackgroundColor--100)');

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
        .attr('marker-end', ({ type }) => type === 'CONNECTOR' && 'url(#arrow)')
        .attr('marker-start', ({ type }) => type === 'LISTENER' && 'url(#arrow)');

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
      p.append('svg:image')
        .attr('xlink:href', router)
        .attr('width', ROUTER_IMG_WIDTH)
        .attr('class', 'routerImg')
        .call(dragSvg() as any);

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
        .call(dragSvg() as any)
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
  function dragSvg() {
    function dragStarted(event: any, d: any) {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;

      isDragging = true;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: any) {
      if (!event.active) {
        simulation.alphaTarget(0);
        simulation.stop();
      }
      d.fx = null;
      d.fy = null;

      isDragging = false;
    }

    return drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded);
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
      .selectAll('.routerImg')
      .attr('x', ({ x }: any) => validatePosition(x, maxSvgPosX, minSvgPosX))
      .attr('y', ({ y }: any) => validatePosition(y, maxSvgPosY, minSvgPosY));

    svgElement
      .selectAll('.devicesImg')
      .attr('cx', ({ x }: any) => validatePosition(x, maxSvgPosX, minSvgPosX))
      .attr('cy', ({ y }: any) => validatePosition(y, maxSvgPosY, minSvgPosY));

    svgElement
      .selectAll('.routerLink')
      .attr('x1', ({ source: { x } }: any) =>
        validatePosition(x + ROUTER_IMG_CENTER_X, maxSvgPosX, minSvgPosX),
      )
      .attr('y1', ({ source: { y } }: any) =>
        validatePosition(y + ROUTER_IMG_CENTER_X, maxSvgPosY, minSvgPosY),
      )
      .attr('x2', (d: any) =>
        validatePosition(
          !d.pType ? d.target.x + ROUTER_IMG_CENTER_X : d.target.x,
          maxSvgPosX,
          minSvgPosX,
        ),
      )
      .attr('y2', (d: any) =>
        validatePosition(
          !d.pType ? d.target.y + ROUTER_IMG_CENTER_X : d.target.y,
          maxSvgPosY,
          minSvgPosY,
        ),
      );

    svgElement
      .selectAll('.routerLinkL')
      .attr('x', (d: any) => {
        if (d.target.x > d.source.x) {
          return validatePosition(
            d.source.x + (d.target.x - d.source.x) / 2 + ROUTER_IMG_CENTER_X,
            maxSvgPosX,
            minSvgPosY,
          );
        }

        return validatePosition(
          d.target.x + (d.source.x - d.target.x) / 2 + ROUTER_IMG_CENTER_X,
          maxSvgPosX,
          minSvgPosX,
        );
      })
      .attr('y', (d: any) => {
        if (d.target.y > d.source.y) {
          return validatePosition(
            d.source.y + (d.target.y - d.source.y) / 2 + ROUTER_IMG_CENTER_X,
            maxSvgPosY,
            minSvgPosY,
          );
        }

        return validatePosition(
          d.target.y + (d.source.y - d.target.y) / 2 + ROUTER_IMG_CENTER_X,
          maxSvgPosY,
          minSvgPosY,
        );
      });
  }
}

export default TopologyMonitoringService;
