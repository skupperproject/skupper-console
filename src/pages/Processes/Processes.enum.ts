export enum ProcessesRoutesPaths {
    Processes = '/processes',
}

export enum ProcessesTableColumns {
    Name = 'Name',
    Site = 'Site',
    SourceIP = 'Source IP',
}

export enum ProcessesLabels {
    Section = 'Processes',
    Description = '',
    Details = 'Details',
    Processes = 'Processes',
    Addresses = 'Addresses',
    Process = 'Process',
    Site = 'Site',
    ProcessGroup = 'Component',
    Image = 'Image',
    SourceIP = 'Source IP',
    Host = 'Host',
    MetricBytesSent = 'Top 5 processes bytes sent',
    MetricBytesReceived = 'Top 5 processes bytes received',
    TrafficInOutDistribution = 'Traffic Sent vs Received',
    TrafficSent = 'Sent',
    TrafficReceived = 'Received',
    Clients = 'Clients',
    Servers = 'Servers',
    GoToTopology = 'Go to the network view',
}

export enum ProcessPairsColumnsNames {
    Process = 'Process',
    BytesTx = 'Sent',
    BytesRx = 'Received',
    LatencyAvgTx = 'Avg Out Latency',
    LatencyAvgRx = 'Avg In Latency',
    Flows = 'Flows',
}
