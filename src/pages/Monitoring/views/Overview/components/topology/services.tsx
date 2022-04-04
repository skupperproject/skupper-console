import React, { useEffect, useRef, useState } from 'react';

import * as d3 from 'd3';

import router from '@assets/router.svg';

// nodes.call(d3.drag().on('start', dragstart).on('drag', dragged).on('end', dragend) as any);

// function dragstart() {}

// function dragged(this: any, d: any) {
//   console.log(this);
//   const node = d3.select(this);
//   node.attr('cx', this.x).attr('cy', this.y);
//   const link = links.filter(function (v: any) {
//     if (v.source.id === d.id || v.target.id === d.id) {
//       return true;
//     }

//     return false;
//   });
//   link.attr('d', function (dd: any) {
//     const x1 = dd.source.x;
//     const y1 = dd.source.y;
//     const x2 = dd.target.x;
//     const y2 = dd.target.y;

//     return `M${x1} ${y1}L${x2} ${y2}`;
//   });
// }

// function dragend() {}

const TopologyTest = function ({ nodesData, linksData, routersNodes, routersLinks }: any) {
  const refBox = useRef<HTMLDivElement>(null);
  const ref = useRef<SVGSVGElement>(null);

  const [boxWidth, setBoxWidth] = useState(0);
  const [boxHeight, setBoxHeight] = useState(0);

  useEffect(() => {
    const svgElement = d3.select(ref.current);

    linksData.some(function (v: any) {
      routersNodes.some(function (w: any) {
        if (v.source === w.id) {
          v.source = w;
        }
      });

      nodesData.some(function (w: any) {
        console.log(v.target, w);

        if (v.target === w.id) {
          v.target = w;
        }
      });
    });

    routersLinks.some(function (v: any) {
      routersNodes.some(function (w: any) {
        if (v.source === w.id) {
          v.source = w;
        }
        if (v.target === w.id) {
          v.target = w;
        }
      });
    });

    svgElement;
    // .selectAll('.flow')
    // .data(linksData)
    // .enter()
    // .append('path')
    // .attr('id', function (d, i) {
    //   return `path_${i}`;
    // })
    // .attr('class', 'flow')
    // .attr('d', function (d: any) {
    //   const x1 = d.source.x + 30;
    //   const y1 = d.source.y + 25;
    //   const x2 = d.target.x + 30;
    //   const y2 = d.target.y + 25;

    //   return `M${x1} ${y1}L${x2} ${y2}`;
    // })
    // .style('stroke', 'gray')
    // .style('storke-width', '1px');

    // Flows
    svgElement
      .selectAll('.deviceLink')
      .data(linksData)
      .enter()
      .append('path')
      .attr('class', 'deviceLink')
      .attr('d', function (d: any) {
        const x1 = d.source.x + 30;
        const y1 = d.source.y + 25;
        const x2 = d.target.x + 40;
        const y2 = d.target.y + 25;

        return `M${x1} ${y1}L${x2} ${y2}`;
      })
      .style('stroke', 'gray')
      .style('storke-width', '1px');

    svgElement
      .selectAll('.device')
      .data(nodesData)
      .join('rect')
      .attr('x', (d: any) => d.x + 30)
      .attr('y', (d: any) => d.y + 25)
      .attr('width', (d: any) => d.width)
      .attr('height', (d: any) => d.height)
      .attr('class', 'device')
      .style('fill', 'red');

    svgElement
      .selectAll('.deviceLabels')
      .filter(function (d: any) {
        return d.type === 'flow';
      })
      .data(nodesData.filter((d: any) => d.type === 'flow'))
      .enter()
      .append('text')
      .text((d: any) => d.name)
      .attr('font-size', 8) //font size
      .attr('x', (d: any) => d.x + 15) //positions text towards the left of the center of the circle
      .attr('y', (d: any) => d.y + 60)
      .attr('class', 'deviceLabels');

    // Routers
    svgElement
      .selectAll('.routerLink')
      .data(routersLinks)
      .enter()
      .append('path')
      .attr('class', 'routerLink')
      .attr('d', function (d: any) {
        const x1 = d.source.x + 30;
        const y1 = d.source.y + 25;
        const x2 = d.target.x + 30;
        const y2 = d.target.y + 25;

        return `M${x1} ${y1}L${x2} ${y2}`;
      })
      .style('stroke', 'gray')
      .style('storke-width', '1px');

    svgElement
      .selectAll('.routerImg')
      .data(routersNodes)
      .join('svg:image')
      .attr('xlink:href', router)
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y)
      .attr('width', (d: any) => d.width)
      .attr('class', 'routerImg');

    svgElement
      .selectAll('.routerLabel')
      .filter(function (d: any) {
        return d.type === 'router';
      })
      .data(routersNodes.filter((d: any) => d.type === 'router'))
      .enter()
      .append('text')
      .text((d: any) => d.name)
      .attr('font-size', 8)
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y + 60)
      .attr('class', 'routerLabel');

    setBoxWidth(refBox.current?.offsetWidth || 0);
    setBoxHeight(refBox.current?.offsetHeight || 0);
  }, [nodesData, linksData, routersLinks, routersNodes]);

  return (
    <div ref={refBox} style={{ width: '100%', height: '100%' }}>
      <svg width={boxWidth} height={boxHeight} ref={ref} />
    </div>
  );
};

export default TopologyTest;
