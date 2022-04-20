import { NetworkStats, RoutersStats } from '../../services/network.interfaces';

export interface RouterStatsRow extends Omit<RoutersStats, 'totalBytes'> {
    totalBytes: string;
}

export interface LinkStatsRow {
    id: string;
    routerNameStart: string;
    routerNameEnd: string;
    cost: number;
    direction: string;
    mode: string;
}

export type NetworkStatsRow = NetworkStats;
