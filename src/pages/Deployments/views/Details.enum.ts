export enum DeploymentDetailsColumns {
    ServiceName = 'Service',
    Ip = 'IP',
    BytesIn = 'Bytes In',
    BytesOut = 'Bytes Out',
    Requests = 'Requests',
    MaxLatency = 'Max Latency',
}

export enum DeploymentDetailsLabels {
    HTTPrequestsIn = 'HTTP Requests received',
    HTTPrequestsOut = 'HTTP  Requests sent',
    TCPconnectionsIn = 'TCP traffic received',
    TCPconnectionsOut = 'TCP traffic sent',
    TabTraffic = 'Traffic',
    TabMetrics = 'Metrics',
}
