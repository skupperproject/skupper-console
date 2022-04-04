import React, { useEffect, useRef } from 'react';

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

const TopologyTest = function ({ nodesData, linksData }: any) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svgElement = d3.select(ref.current);
    // const nodesData = [
    //   {
    //     id: 1,
    //     ip: '1.1.1.1',
    //     r: 20,
    //     x: 200,
    //     y: 300,
    //   },
    //   {
    //     id: 2,
    //     ip: '1.1.1.2',
    //     r: 30,
    //     x: 300,
    //     y: 300,
    //   },
    //   {
    //     id: 3,
    //     ip: '1.1.1.3',
    //     r: 15,
    //     x: 450,
    //     y: 200,
    //   },
    //   {
    //     id: 4,
    //     ip: '1.1.1.4',
    //     r: 20,
    //     x: 450,
    //     y: 400,
    //   },
    // ];
    // const linksData = [
    //   {
    //     source: 1,
    //     target: 2,
    //   },
    //   {
    //     source: 2,
    //     target: 3,
    //   },
    //   {
    //     source: 2,
    //     target: 4,
    //   },
    // ];

    linksData.some(function (v: any) {
      nodesData.some(function (w: any) {
        if (v.source === w.id) {
          v.source = w;
        }
        if (v.target === w.id) {
          v.target = w;
        }
      });
    });

    svgElement
      .selectAll('path')
      .data(linksData)
      .enter()
      .append('path')
      .attr('id', function (d, i) {
        return `path_${i}`;
      })
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
      .selectAll('text')
      .data(linksData)
      .enter()
      .append('text')
      .append('textPath')
      .attr('xlink:href', function (d, i) {
        return `#path_${i}`;
      })
      .text(function (d: any) {
        console.log(d);

        return d.octets;
      });

    svgElement
      .selectAll('circle')
      .data(nodesData.filter((d: any) => d.type === 'flow'))
      .join('circle')
      .attr('cx', (d: any) => d.x + 30)
      .attr('cy', (d: any) => d.y + 25)
      .attr('r', (d: any) => d.r)
      .style('fill', 'gray');

    svgElement
      .selectAll('text')
      .data(nodesData.filter((d: any) => d.type === 'device'))
      .enter()
      .append('text')
      .text((d: any) => d.name)
      .attr('font-size', 8) //font size
      .attr('dx', (d: any) => d.x) //positions text towards the left of the center of the circle
      .attr('dy', (d: any) => d.y + 60);

    svgElement
      .selectAll('text')
      .data(nodesData.filter((d: any) => d.type === 'flow'))
      .enter()
      .append('text')
      .text((d: any) => d.name)
      .attr('font-size', 8) //font size
      .attr('dx', (d: any) => d.x + 15) //positions text towards the left of the center of the circle
      .attr('dy', (d: any) => d.y + 40);

    svgElement
      .selectAll('image')
      .data(nodesData.filter((d: any) => d.type === 'device'))
      .join('svg:image')
      .attr('xlink:href', router)
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y)
      .attr('width', (d: any) => d.width);
  }, [nodesData, linksData]);

  return <svg width="800" height="800" ref={ref} />;
};

export default TopologyTest;
