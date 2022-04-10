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
export type VansStats = VanAddressStatsResponse;
export interface MonitoringInfo {
  vansStats: VansStats[];
  routersStats: RoutersStats[];
  monitoringStats: MonitoringStats[];
}
