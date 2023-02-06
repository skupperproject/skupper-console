export interface GraphNode {
    id: string;
    name: string;
    x: number;
    y: number;
    color: string;
    groupName: string;
    group: number;
    img?: string;
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
    isActive?: boolean;
}

export interface GraphEdgeModifiedByForce {
    source: GraphNode;
    target: GraphNode;
    type?: 'dashed';
    isActive?: boolean;
}
