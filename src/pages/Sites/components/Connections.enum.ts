export enum ConnectionsLabels {
    HTTPrequestsIn = 'HTTP Requests Received',
    HTTPrequestsOut = 'HTTP Requests Sent',
    TCPconnectionsIn = 'TCP traffic received',
    TCPconnectionsOut = 'TCP traffic sent',
}

export enum ConnectionsColumns {
    Name = 'Site',
    Ip = 'IP',
    Bytes = 'Bytes',
    BytesIn = 'Bytes In',
    BytesOut = 'Bytes Out',
    Requests = 'Requests',
    MaxLatency = 'Max Latency',
}
