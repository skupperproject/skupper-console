export interface SiteTopologyNode {
    id: string;
    name: string;
    x: number;
    y: number;
    group: number;
    type: string;
    fx?: number | null;
    fy?: number | null;
}

export type DeploymentTopologyNode = {
    id: string;
    name: string;
    x: number;
    y: number;
    group: number;
    type: string;
    fx?: number | null;
    fy?: number | null;
};

export type DeploymentsNode = SiteTopologyNode | DeploymentTopologyNode;

export interface SitesTopologyLink {
    source: string;
    target: string;
    targetId: string;
    sourceId: string;
    type: string;
}

export interface SitesTopologyLinkNormalized {
    source: DeploymentsNode;
    target: DeploymentsNode;
    type: string;
}

export type TopologySVG =
    | (SVGSVGElement & { zoomIn: () => void; zoomOut: () => void; reset: () => void })
    | null;
