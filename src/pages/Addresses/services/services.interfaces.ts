// FLOW PAIR BASIC INFO
export interface FlowPairBasic {
  id: string;
  siteId: string;
  siteName: string;
  byteRate: number;
  bytes: number;
  host: string;
  port: string;
  processId: string;
  processName: string;
  latency: number;
  startTime: number;
  endTime?: number;
  targetSiteId: string;
  targetSiteName: string;
  targetByteRate: number;
  targetBytes: number;
  targetProcessId: string;
  targetProcessName: string;
  targetLatency: number;
}
