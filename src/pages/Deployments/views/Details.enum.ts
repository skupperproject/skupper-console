export enum DeploymentDetailsColumns {
    ServiceName = 'Service',
    Ip = 'IP',
    BytesIn = 'Bytes In',
    BytesOut = 'Bytes Out',
    Requests = 'Requests',
    MaxLatency = 'Max Latency',
}

export enum DeploymentDetailsLabels {
    HTTPrequestsIn = 'HTTP Requests Received',
    HTTPrequestsOut = 'HTTP Requests Sent',
    TCPconnectionsIn = 'TCP traffic received',
    TCPconnectionsOut = 'TCP traffic sent',
    TabTraffic = 'Traffic',
    TabMetrics = 'Metrics',
}
