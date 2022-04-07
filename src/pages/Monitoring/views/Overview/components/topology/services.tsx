import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import * as d3 from 'd3';

import router from '@assets/router.svg';
import { formatTime } from '@utils/formatTime';

const tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "1000")
  .style("visibility", "hidden")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")
  .html("");

const CIRCLE_R = 10;
const ROUTER_IMG_WIDTH = 50;

const TopologyTest = memo(function ({ nodes, links }: any) {
  const refBox = useRef<HTMLDivElement>(null);
  const ref = useRef<SVGSVGElement>(null);

  const [boxWidth, setBoxWidth] = useState(0);
  const [boxHeight, setBoxHeight] = useState(0);

  const simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-50))
    .force("collide", d3.forceCollide(0.9).radius(50).iterations(1))
    .force("link", d3.forceLink().strength((d: any) => d.pType ? 0.015 : 0.001).id(function (d: any) {
      return d.id;
    }));


  const dragHandler = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended) as any;


  function dragstarted(event: any, d: any) {
    if (!event.active) { simulation.alphaTarget(0.03).restart(); }
    d.fx = d.x;
    d.fy = d.y;
  }

  // Fix the position of the node that we are looking at
  function dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  // Let the node do what it wants again once we've looked at it
  function dragended(event: any, d: any) {
    if (!event.active) { simulation.alphaTarget(0); }
    d.fx = null;
    d.fy = null;
  }


  const updateNodes = useCallback(() => {
    const svgElement = d3.select(ref.current);

    svgElement
      .selectAll('.routerImg')
      .call(dragHandler)
      .data(nodes.filter((node: any) => node.type !== 'flow'))
      .enter()
      .call(function (p) {
        p.append('svg:image')
          .attr('xlink:href', router)
          .attr('width', ROUTER_IMG_WIDTH)
          .attr('class', 'routerImg');

        p.append('text')
          .attr('class', 'routerImg')
          .text((d: any) => d.name)
          .attr('font-size', 10);
      })
      .exit().remove();

    svgElement
      .selectAll('.devicesImg')
      .call(dragHandler)
      .data(nodes.filter((node: any) => node.type === 'flow'))
      .enter()
      .call(function (p) {

        p.append('circle')
          .attr('class', 'devicesImg')
          .attr('r', CIRCLE_R)
          .style('stroke', 'steelblue')
          .style('stroke-width', '1px')
          .style('fill', (d: any) => d.rtype === 'CONNECTOR' ? 'steelblue' : '#f0f0f0')
          .on("mouseover", function (e: any, { name, rtype, numFlows, avgLatency }: any) {
            tooltip.html(`
            <p>name: ${name}</p>
            <p>type: ${rtype}</p>
            <p>flows: ${numFlows}</p>
            <p>Avg Latency: ${formatTime(avgLatency)}</p>
            `);

            return tooltip.style("visibility", "visible");
          })
          .on("mousemove", function (event: any) { return tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`); })
          .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });
      })
      .exit().remove();

  }, [dragHandler, nodes]);


  const updateLinks = useCallback(() => {
    const svgElement = d3.select(ref.current);

    return svgElement
      .selectAll('.routerLink')
      .data(links)
      .enter()

      .call(function (p) {
        p.append('line')
          .attr('class', 'routerLink')
          .style('stroke', 'gray')
          .style('stroke-width', '20px')
          .style('opacity', 0)
          .on("mouseover", function (_, { cost, bytes }: any) {
            const template = cost ? `<p>cost: ${cost}</p>` : `<p>traffic: ${bytes}</p>`;
            tooltip.html(template);


            return tooltip.style("visibility", "visible");
          })
          .on("mousemove", function (event: any) { return tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`); })
          .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });
        p.append('line')
          .attr('class', 'routerLink')
          .style('stroke', 'gray')
          .style('stroke-width', '1px')
          .attr("marker-end", ((d: any) => d.type && d.type !== 'CONNECTOR' && "url(#arrow)"))
          .attr("marker-start", ((d: any) => d.type && d.type === 'CONNECTOR' && "url(#arrow)"));

        p.append('text')
          .attr('text-anchor', 'middle')
          .attr('class', 'routerLinkL')
          .attr('font-size', 14)
          .text(function (d: any) {
            return d.type !== 'CONNECTOR' && d.type !== 'LISTENER' ? d.cost : d.bytes;
          });
      })
      .exit().remove();
  }, [links]);


  const ticked = useCallback(() => {
    const svgElement = d3.select(ref.current);

    svgElement
      .selectAll('.routerLink')
      .attr('x1', (d: any) => d.source.x + ROUTER_IMG_WIDTH / 2)
      .attr('y1', (d: any) => d.source.y + ROUTER_IMG_WIDTH / 2)
      .attr('x2', (d: any) => !d.pType ? d.target.x + ROUTER_IMG_WIDTH / 2 : d.target.x)
      .attr('y2', (d: any) => !d.pType ? d.target.y + ROUTER_IMG_WIDTH / 2 : d.target.y);

    svgElement
      .selectAll('.routerLinkL')
      .attr('x', (d: any) => {
        if (d.target.x > d.source.x) {
          return (d.source.x + (d.target.x - d.source.x) / 2) + ROUTER_IMG_WIDTH / 2;
        }

        return (d.target.x + (d.source.x - d.target.x) / 2) + ROUTER_IMG_WIDTH / 2;
      })
      .attr('y', (d: any) => {
        if (d.target.y > d.source.y) {
          return (d.source.y + (d.target.y - d.source.y) / 2) + ROUTER_IMG_WIDTH / 2;
        }

        return (d.target.y + (d.source.y - d.target.y) / 2) + ROUTER_IMG_WIDTH / 2;
      });

    svgElement
      .selectAll('.routerImg')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y);

    svgElement
      .selectAll('.devicesImg')
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y);
  }, []);

  useEffect(() => {

    links.some(function (v: any) {
      nodes.some(function (w: any) {
        if (v.source === w.id) {
          v.source = w;
        }
        if (v.target === w.id) {
          v.target = w;
        }
      });
    });

    updateLinks();
    updateNodes();

    simulation
      .nodes(nodes)
      .on("tick", ticked);

    simulation
      .force<any>("link")
      .links(links);

  }, [links, nodes, simulation, ticked, updateLinks, updateNodes]);

  useEffect(() => {
    const svgElement = d3.select(ref.current);

    svgElement.append("svg:defs").append("svg:marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr('refX', ROUTER_IMG_WIDTH / 2)
      .attr("markerWidth", 9)
      .attr("markerHeight", 9)
      .attr("orient", "auto-start-reverse")
      .append("svg:path")
      .style('fill', 'gray')
      .attr("d", "M0,-5L10,0L0,5");

    setBoxWidth(refBox.current?.offsetWidth || 0);
    setBoxHeight(refBox.current?.offsetHeight || 0);
    simulation.force("center", d3.forceCenter((refBox.current?.offsetWidth || 2) / 2, (refBox.current?.offsetHeight || 2) / 2));

  }, []);

  return (
    <div ref={refBox} style={{ width: '100%', height: '100%' }}>
      <svg width={boxWidth} height={boxHeight} ref={ref} />
    </div>
  );
});

export default TopologyTest;
