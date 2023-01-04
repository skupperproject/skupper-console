// Process TABLE
export interface ProcessRow {
    identity: string;
    siteId: string;
    siteName: string;
    processName: string;
    bytes: number;
    byteRate: number;
    host: string;
    groupId: string;
    groupName: string;
    imageName: string;
}

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
