export enum SiteDetailsColumns {
    Name = 'Site',
    Ip = 'IP',
    BytesIn = 'Bytes In',
    BytesOut = 'Bytes Out',
    Requests = 'Requests',
    MaxLatency = 'Max Latency',
}

export enum SiteDetailsColumnsLabels {
    HTTPrequestsIn = 'HTTP Requests Received',
    HTTPrequestsOut = 'HTTP Requests Sent',
    TCPconnectionsIn = 'Inbound TCP Connections',
    TCPconnectionsOut = 'Outbound TCP Connections',
}

export enum SitesDetailsLabels {
    Details = 'Site Details',
    TabConnections = 'Connections',
    TabMetrics = 'Metrics',
}
