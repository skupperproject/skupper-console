export interface TopologyNode {
    id: string;
    name: string;
    x: number;
    y: number;
    color: string;
    groupName: string;
    group: number;
    type: string;
    img?: XMLDocument;
    fx: number | null;
    fy: number | null;
    groupFx?: number;
    groupFy?: number;
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
