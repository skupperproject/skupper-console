export interface GraphNode {
    id: string;
    name: string;
    color: string;
    groupName: string;
    group: number;
    img?: string;
    x: number;
    y: number;
    fx?: number | null;
    fy?: number | null;
    groupFx?: number;
    groupFy?: number;
    isDisabled?: boolean;
}

export interface GraphEdge<T = GraphNode> {
    source: T;
    target: T;
    type?: 'dashed';
    isActive?: boolean;
    rate?: string;
}
