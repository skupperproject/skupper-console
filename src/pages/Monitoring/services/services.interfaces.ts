import {
  FlowsResponse,
  MonitoringStatsResponse,
  RoutersStatsResponse,
  VansStatsResponse,
} from '@models/API/REST.interfaces';

export type Flow = FlowsResponse;
export type RoutersStats = RoutersStatsResponse;
export type MonitoringStats = MonitoringStatsResponse;
export type vansStats = VansStatsResponse;

export interface VansInfo {
  id: string;
  name: string;
  nunDevices: number;
  numFlows: number;
}
export interface MonitoringInfo {
  vansStats: vansStats[];
  routersStats: RoutersStats[];
  monitoringStats: MonitoringStats[];
}
