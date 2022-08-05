export enum ConnectionsLabels {
    HTTPprotocol = 'HTTP protocol',
    TCPprotocol = 'TCP protocol',
    HTTPrequestsIn = 'HTTP Requests Received',
    HTTPrequestsOut = 'HTTP Requests Sent',
    TCPconnectionsIn = 'TCP traffic received',
    TCPconnectionsOut = 'TCP traffic sent',
}

export enum ConnectionsColumns {
    Name = 'Sites',
    Ip = 'IP',
    Bytes = 'Bytes',
    BytesIn = 'Bytes Received',
    BytesOut = 'Bytes Sent',
    Requests = 'Requests',
    MaxLatency = 'Max Latency',
}

export enum HTTPRequestsColumns {
    Name = 'Sites',
    Ip = 'IP',
    Bytes = 'Bytes',
    BytesIn = 'Bytes Received',
    BytesOut = 'Bytes Sent',
    RequestsCountSent = 'Requests sent',
    RequestsCountReceived = 'Requests received',
    MaxLatencySent = 'Max Latency sent',
    MaxLatencyReceived = 'Max Latency received',
}
