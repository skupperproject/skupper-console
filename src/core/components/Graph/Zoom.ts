import { Selection } from 'd3-selection';
import { zoom, zoomIdentity, ZoomBehavior, zoomTransform } from 'd3-zoom';

import { GraphNode } from './Graph.interfaces';

interface GraphProps {
  svgGraph: Selection<SVGSVGElement, GraphNode, null, undefined>;
  svgGraphGroup: Selection<SVGGElement, GraphNode, null, undefined>;
}

class GraphZoom {
  zoom: ZoomBehavior<SVGSVGElement, GraphNode>;
  private svgGraph: Selection<SVGSVGElement, GraphNode, null, undefined>;
  private svgGraphGroup: Selection<SVGGElement, GraphNode, null, undefined>;

  constructor({ svgGraph, svgGraphGroup }: GraphProps) {
    this.svgGraph = svgGraph;
    this.svgGraphGroup = svgGraphGroup;

    // Create a zoom behavior and set its scale extent to limit the zoom level
    this.zoom = zoom<SVGSVGElement, GraphNode>()
      .scaleExtent([0.2, 5])
      .on('zoom', ({ transform }) => {
        this.svgGraphGroup.attr('transform', transform);
      });

    // Apply the zoom behavior to the SVG element
    this.svgGraph.call(this.zoom);
  }

  public zoomToDefaultPosition() {
    const $node = this.svgGraph.node();
    if (!$node) {
      return;
    }

    const { width, height } = $node.getBBox();
    const center: [number, number] = [width / 2, height / 2];
    const transform = zoomTransform($node).invert(center);

    (this.svgGraph as any).transition().duration(300).call(this.zoom.transform, zoomIdentity, transform);
  }

  public increaseZoomLevel() {
    return (this.svgGraph as any).transition().duration(250).call(this.zoom.scaleBy, 1.5);
  }

  public decreaseZoomLevel() {
    return (this.svgGraph as any).transition().duration(250).call(this.zoom.scaleBy, 0.5);
  }
}

export default GraphZoom;
