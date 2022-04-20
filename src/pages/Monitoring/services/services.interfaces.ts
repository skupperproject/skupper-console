import {
    FlowsResponse,
    MonitoringRoutersTopologyResponse,
    MonitoringStatsResponse,
    RouterStatsResponse,
    NetworkStatsResponse,
} from '@models/API/REST.interfaces';

export type Flow = FlowsResponse;
export type MonitoringRoutersTopology = MonitoringRoutersTopologyResponse;

export type RoutersStats = RouterStatsResponse;

export type MonitoringStats = MonitoringStatsResponse;
export type VanStats = NetworkStatsResponse;
export interface MonitoringInfo {
    vansStats: VanStats[];
    routersStats: RoutersStats[];
    monitoringStats: MonitoringStats[];
}
