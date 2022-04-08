import * as d3 from 'd3';

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

const tooltip = d3
  .select('body')
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

  const simulation = d3
    .forceSimulation(nodes)
    .force('center', d3.forceCenter((boxWidth || 2) / 2, (boxHeight || 2) / 2))
    .force('charge', d3.forceManyBody().strength(-50))
    .force('collide', d3.forceCollide(0.9).radius(50).iterations(1))
    .force(
      'link',
      d3
        .forceLink()
        .strength(({ pType }: any) => (pType ? 0.015 : 0.001))
        .id(function ({ id }: any) {
          return id;
        }),
    )
    .on('tick', ticked);

  links.some(function (link) {
    nodes.some(function (node) {
      if (link.source === node.id) {
        link.source = node as any;
      }
      if (link.target === node.id) {
        link.target = node as any;
      }
    });
  });

  // root
  const svgElement = d3
    .select($node)
    .append('svg')
    .attr('width', boxWidth)
    .attr('height', boxHeight);

  // arrow
  svgElement
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', ROUTER_IMG_WIDTH / 2)
    .attr('markerWidth', 9)
    .attr('markerHeight', 9)
    .attr('orient', 'auto-start-reverse')
    .append('svg:path')
    .style('fill', 'gray')
    .attr('d', 'M0,-5L10,0L0,5');

  function ticked() {
    svgElement
      .selectAll('.routerImg')
      .attr('x', ({ x }: any) => x)
      .attr('y', ({ y }: any) => y);

    svgElement
      .selectAll('.devicesImg')
      .attr('cx', ({ x }: any) => x)
      .attr('cy', ({ y }: any) => y);

    svgElement
      .selectAll('.routerLink')
      .attr('x1', (d: any) => d.source.x + ROUTER_IMG_WIDTH / 2)
      .attr('y1', (d: any) => d.source.y + ROUTER_IMG_WIDTH / 2)
      .attr('x2', (d: any) => (!d.pType ? d.target.x + ROUTER_IMG_WIDTH / 2 : d.target.x))
      .attr('y2', (d: any) => (!d.pType ? d.target.y + ROUTER_IMG_WIDTH / 2 : d.target.y));

    svgElement
      .selectAll('.routerLinkL')
      .attr('x', (d: any) => {
        if (d.target.x > d.source.x) {
          return d.source.x + (d.target.x - d.source.x) / 2 + ROUTER_IMG_WIDTH / 2;
        }

        return d.target.x + (d.source.x - d.target.x) / 2 + ROUTER_IMG_WIDTH / 2;
      })
      .attr('y', (d: any) => {
        if (d.target.y > d.source.y) {
          return d.source.y + (d.target.y - d.source.y) / 2 + ROUTER_IMG_WIDTH / 2;
        }

        return d.target.y + (d.source.y - d.target.y) / 2 + ROUTER_IMG_WIDTH / 2;
      });
  }

  // links
  svgElement
    .selectAll('.routerLink')
    .data(links)
    .enter()
    .call(function (p) {
      // hidden link line. Creates an area  to trigger mouseover and show the popup
      p.append('line')
        .attr('class', 'routerLink')
        .style('stroke', 'transparent')
        .style('stroke-width', '24px')
        .style('opacity', 0)
        .on('mouseover', function (_, { cost, bytes }: any) {
          const template = cost ? `<p>cost: ${cost}</p>` : `<p>traffic: ${bytes}</p>`;
          tooltip.html(template);

          return tooltip.style('visibility', 'visible');
        })
        .on('mousemove', function ({ pageY, pageX }: any) {
          return tooltip.style('top', `${pageY - 10}px`).style('left', `${pageX + 10}px`);
        })
        .on('mouseout', function () {
          return tooltip.style('visibility', 'hidden');
        });

      p.append('line')
        .attr('class', 'routerLink')
        .style('stroke', 'var(--pf-global--palette--black-400)')
        .style('stroke-width', '1px')
        .attr('marker-end', ({ type }: any) => type !== 'CONNECTOR' && 'url(#arrow)')
        .attr('marker-start', ({ type }: any) => type === 'CONNECTOR' && 'url(#arrow)');

      // label
      p.append('text')
        .attr('class', 'routerLinkL')
        .attr('font-size', 14)
        .attr('font-size', function ({ type }: any) {
          return type !== 'CONNECTOR' && type !== 'LISTENER' ? 24 : 10;
        })
        .attr('font-size', function ({ type }: any) {
          return type !== 'CONNECTOR' && type !== 'LISTENER' ? 24 : 10;
        })
        .style('fill', 'var(--pf-global--palette--light-blue-500)')
        .text(function ({ type, cost, bytes }: any) {
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
        .call(drag(simulation));

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
            : 'var(--pf-global--palette--black-200)',
        )
        .call(drag(simulation))
        .on('mouseover', function (_, { name, rtype, numFlows, avgLatency }: any) {
          tooltip.html(`
          <p>name: ${name}</p>
          <p>type: ${rtype}</p>
          <p>flows: ${numFlows}</p>
          <p>Avg Latency: ${formatTime(avgLatency)}</p>
          `);

          return tooltip.style('visibility', isDragging ? 'hidden' : 'visible');
        })
        .on('mousemove', function (event: any) {
          return tooltip
            .style('top', `${event.pageY - 10}px`)
            .style('left', `${event.pageX + 10}px`);
        })
        .on('mouseout', function () {
          return tooltip.style('visibility', 'hidden');
        });
    });

  // drag util
  function drag(forceSimulatio: any) {
    function dragstarted(event: any, d: any) {
      if (!event.active) {
        forceSimulatio.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;

      isDragging = true;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) {
        forceSimulatio.alphaTarget(0);
        forceSimulatio.stop();
      }
      d.fx = null;
      d.fy = null;

      isDragging = false;
    }

    return d3
      .drag<any, any, MonitoringTopologyLink>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  simulation.nodes(nodes);
  simulation.force<any>('link')?.links(links);
}

export default TopologyMonitoringService;
