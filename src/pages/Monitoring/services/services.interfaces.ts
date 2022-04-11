import {
  FlowsResponse,
  MonitoringRoutersTopologyResponse,
  MonitoringStatsResponse,
  RouterStatsResponse,
  VanAddressStatsResponse,
} from '@models/API/REST.interfaces';

export type Flow = FlowsResponse;
export type MonitoringRoutersTopology = MonitoringRoutersTopologyResponse;

export type RoutersStats = RouterStatsResponse;

export type MonitoringStats = MonitoringStatsResponse;
export type VanStats = VanAddressStatsResponse;
export interface MonitoringInfo {
  vansStats: VanStats[];
  routersStats: RoutersStats[];
  monitoringStats: MonitoringStats[];
}
