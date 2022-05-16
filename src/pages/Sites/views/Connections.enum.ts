export enum SitesConnectionsLabels {
    HTTPrequestsIn = 'HTTP Requests Received',
    HTTPrequestsOut = 'HTTP Requests Sent',
    TCPconnectionsIn = 'TCP traffic received',
    TCPconnectionsOut = 'TCP traffic sent',
}

export enum SitesConnectionsColumns {
    Name = 'Site',
    Ip = 'IP',
    BytesIn = 'Bytes In',
    BytesOut = 'Bytes Out',
    Requests = 'Requests',
    MaxLatency = 'Max Latency',
}
