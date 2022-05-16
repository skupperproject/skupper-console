export enum ConnectionsDetailsLabels {
    HTTPrequestsIn = 'HTTP Requests Received',
    HTTPrequestsOut = 'HTTP Requests Sent',
    TCPconnectionsIn = 'TCP traffic received',
    TCPconnectionsOut = 'TCP traffic sent',
}

export enum ConnectionsDetailsColumns {
    Name = 'Site',
    Ip = 'IP',
    BytesIn = 'Bytes In',
    BytesOut = 'Bytes Out',
    Requests = 'Requests',
    MaxLatency = 'Max Latency',
}
