import { FlowTopologyRoutersLink } from '@models/API/REST.interfaces';

export interface MonitoringTopologyDeviceLink {
  source: string;
  target: string;
  type: string;
  pType: string;
  bytes: string;
}

export type MonitoringTopologyRouterLink = FlowTopologyRoutersLink;

export type MonitoringTopologyLink = MonitoringTopologyRouterLink | MonitoringTopologyDeviceLink;

export interface MonitoringTopologyRouterNode {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  type: string;
}

export interface MonitoringTopologyDeviceNode {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
  rtype: string;
  avgLatency: number;
  numFlows: number;
}

export type MonitoringTopologyNode = MonitoringTopologyRouterNode | MonitoringTopologyDeviceNode;
