import { RouterStatsResponse, MonitoringStatsResponse } from '@models/API/REST.interfaces';

export type RoutersStats = RouterStatsResponse;
export type NetworkStats = MonitoringStatsResponse;

export interface Network {
    networkStats: NetworkStats[];
    routersStats: RoutersStats[];
}
