export interface TopologyNode {
    id: string;
    name: string;
    x: number;
    y: number;
    group: number;
    type: string;
    fx?: number | null;
    fy?: number | null;
}

export interface TopologyLink {
    source: string;
    target: string;
    type: string;
}

export interface TopologyLinkNormalized {
    source: TopologyNode;
    target: TopologyNode;
    type: string;
}

export type TopologySVG =
    | (SVGSVGElement & {
          zoomIn: () => void;
          zoomOut: () => void;
          reset: () => void;
          isDragging: () => boolean;
      })
    | null;
