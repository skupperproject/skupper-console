export enum TrafficLabels {
    HTTPtraffic = 'HTTP traffic',
    HTTPrequestsIn = 'HTTP traffic received from:',
    HTTPrequestsOut = 'HTTP  traffic sent to:',
    TCPTraffic = 'TCP traffic',
    TCPconnectionsIn = 'TCP traffic received from:',
    TCPconnectionsOut = 'TCP traffic sent to:',
}

export enum TrafficColumns {
    SiteName = 'Site',
    ServiceName = 'Service',
    Bytes = 'Bytes',
    Requests = 'Requests',
    MaxLatency = 'Max Latency',
}
