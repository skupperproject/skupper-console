export interface GraphNode {
    id: string;
    name: string;
    x: number;
    y: number;
    color: string;
    groupName: string;
    group: number;
    img?: XMLDocument;
    fx: number | null;
    fy: number | null;
    groupFx?: number;
    groupFy?: number;
    isDisabled?: boolean;
}

export interface GraphEdge {
    source: string;
    target: string;
    type?: 'dashed';
}

export interface GraphEdgeModifiedByForce {
    source: GraphNode;
    target: GraphNode;
    type?: 'dashed';
}
