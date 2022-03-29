import {
  FlowsResponse,
  MonitoringStatsResponse,
  RoutersStatsResponse,
  VansStatsResponse,
} from '@models/API/REST.interfaces';

export type Flow = FlowsResponse;
export type RoutersStats = RoutersStatsResponse;
export type MonitoringStats = MonitoringStatsResponse;
export type VansStats = VansStatsResponse;

export interface VansInfo {
  id: string;
  name: string;
  nunDevices: number;
  numFlows: number;
}
export interface MonitoringInfo {
  vansStats: VansStats[];
  routersStats: RoutersStats[];
  monitoringStats: MonitoringStats[];
}
