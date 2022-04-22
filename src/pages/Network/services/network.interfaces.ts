import { RouterStatsResponse, MonitoringStatsResponse } from 'API/REST.interfaces';

export type RoutersStats = RouterStatsResponse;
export type NetworkStats = MonitoringStatsResponse;

export interface Network {
    networkStats: NetworkStats[];
    routersStats: RoutersStats[];
}
