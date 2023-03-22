export enum ProcessesRoutesPaths {
  Processes = '/processes'
}

export enum ProcessesTableColumns {
  Name = 'Name',
  Site = 'Site',
  Component = 'Component'
}

export enum ProcessesLabels {
  Section = 'Processes',
  Description = 'A process represents one specific instance that is currently executing. It contains all runtime information related to that instance',
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
  TrafficInOutDistribution = 'Traffic distribution',
  ChartProcessDataTrafficSeriesAxisYLabel = 'Throughput',
  ChartProcessLatencySeriesAxisYLabel = 'Latency',
  RequestsPerSecondsSeriesAxisYLabel = 'Hits per second',
  ErrorRateSeriesAxisYLabel = 'Error rate',
  TrafficTotal = 'Total',
  TrafficSent = 'Sent',
  TrafficReceived = 'Received',
  Clients = 'Clients',
  Servers = 'Servers',
  TcpConnection = 'TCP connections',
  HttpRequests = 'Http requests',
  GoToTopology = 'Go to the network view',
  FilterProcessesConnectedDefault = 'All Processes',
  FilterProtocolsDefault = 'All Protocols',
  NoMetricFoundMessage = 'No metrics found. Try adjusting your filter options',
  LatencyMetricAvg = 'Avg latency',
  LatencyMetric50quantile = '50th percentile',
  LatencyMetric90quantile = '90th percentile',
  LatencyMetric99quantile = '99th percentile',
  ByteRateAvgCol = 'avg',
  ByteRateTotalCol = 'total',
  ByteRateCurrentCol = 'current',
  ByteRateMaxCol = 'max'
}

export enum ProcessPairsColumnsNames {
  Process = 'Process',
  Traffic = 'Data Traffic',
  BytesTx = 'Sent',
  BytesRx = 'Received',
  Latency = 'Latency',
  AvgLatency = 'Avg  Latency',
  LatencyAvgTx = 'Avg Tx Latency',
  LatencyAvgRx = 'Avg Rx Latency',
  Flows = 'Flows',
  ViewDetails = 'view details',
  Title = 'Processes Data transfers'
}
