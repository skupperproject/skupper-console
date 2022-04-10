import { MonitoringRoutersTopologyLink } from '@models/API/REST.interfaces';

export interface MonitoringTopologyDeviceLink {
  source: string;
  target: string;
  type: string;
  pType: string;
  bytes: string;
  protocol: string;
}

export type MonitoringTopologyRouterLink = MonitoringRoutersTopologyLink;

export interface MonitoringTopologyLink {
  source: string;
  target: string;
  type?: string;
  pType?: string;
  bytes?: string;
  protocol?: string;
  mode?: string;
  cost?: string;
}

export interface MonitoringTopologyLinkNormalized {
  type?: string;
  pType?: string;
  bytes?: string;
  protocol?: string;
  mode?: string;
  cost?: string;
  source: MonitoringTopologyNode | string;
  target: MonitoringTopologyNode | string;
}

export interface MonitoringTopologyRouterNode {
  id: string;
  name: string;
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
  width: number;
  type: string;
}

export interface MonitoringTopologyDeviceNode {
  id: string;
  name: string;
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
  type: string;
  rtype: string;
  protocol: string;
  avgLatency: number;
  numFlows: number;
}

export type MonitoringTopologyNode = MonitoringTopologyRouterNode | MonitoringTopologyDeviceNode;
