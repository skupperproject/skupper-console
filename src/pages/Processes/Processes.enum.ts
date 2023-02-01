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
    TrafficInOutDistribution = 'Inbound vs Outbound Traffic',
    TrafficSent = 'Outbound traffic',
    TrafficReceived = 'Inbound Traffic',
    Clients = 'Clients',
    Servers = 'Servers',
}

export enum ProcessPairsColumnsNames {
    Process = 'Process',
    BytesTx = 'Outbound',
    BytesRx = 'Inbound',
    LatencyAvgTx = 'Avg Out Latency',
    LatencyAvgRx = 'Avg In Latency',
    Flows = 'Flows',
}
