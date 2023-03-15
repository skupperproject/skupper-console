export enum ProcessesRoutesPaths {
  Processes = '/processes'
}

export enum ProcessesTableColumns {
  Name = 'Name',
  Site = 'Site',
  SourceIP = 'Source IP'
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
  TrafficTotal = 'Total',
  TrafficSent = 'Sent',
  TrafficReceived = 'Received',
  Clients = 'Data received from clients',
  Servers = 'Data sent to servers',
  TcpConnection = 'TCP connections',
  HttpRequests = 'Http requests',
  GoToTopology = 'Go to the network view'
}

export enum ProcessPairsColumnsNames {
  Process = 'Process',
  Traffic = 'Data Traffic',
  BytesTx = 'Sent',
  BytesRx = 'Received',
  AvgLatency = 'Avg  Latency',
  LatencyAvgTx = 'Avg Tx Latency',
  LatencyAvgRx = 'Avg Rx Latency',
  Flows = 'Flows',
  ViewDetails = 'view details',
  Title = 'Processes Data transfers'
}
