export enum ConnectionsLabels {
    HTTPProtocol = 'HTTP protocol',
    TCPProtocol = 'TCP protocol',
    HTTPRequestsIn = 'HTTP Requests Received',
    HTTPRequestsOut = 'HTTP Requests Sent',
    TCPConnectionsIn = 'TCP traffic received',
    TCPConnectionsOut = 'TCP traffic sent',
}

export enum ConnectionsColumns {
    Name = 'Name',
    Ip = 'IP',
    Bytes = 'Bytes',
    BytesIn = 'Bytes Received',
    BytesOut = 'Bytes Sent',
    Requests = 'Requests',
    MaxLatency = 'Max Latency',
}
