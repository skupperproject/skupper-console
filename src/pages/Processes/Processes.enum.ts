export enum ProcessesRoutesPaths {
  Processes = '/processes'
}

export enum ProcessesTableColumns {
  Name = 'Name',
  Site = 'Site',
  Component = 'Component',
  Exposed = 'Exposed'
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
  Created = 'Created',
  SourceIP = 'Source IP',
  Host = 'Host',
  TrafficInOutDistribution = 'Traffic distribution',
  ChartProcessDataTrafficSeriesAxisYLabel = 'Throughput bytes',
  ChartProcessLatencySeriesAxisYLabel = 'Latency',
  RequestsPerSecondsSeriesAxisYLabel = 'Request rate',
  ErrorRateSeriesAxisYLabel = 'Error rate',
  TrafficTotal = 'Total',
  TrafficSent = 'To servers',
  TrafficReceived = 'From clients',
  Clients = 'Clients',
  Servers = 'Servers',
  TcpConnection = 'Live tcp connections',
  HttpRequests = 'Http requests in the last 15 minutes',
  GoToTopology = 'Go to the Topology view',
  ByteRateAvgCol = 'avg',
  ByteRateTotalCol = 'total',
  ByteRateCurrentCol = 'current',
  ByteRateMaxCol = 'max',
  ExposedTitle = 'Exposed',
  Exposed = 'yes',
  NotExposed = 'no'
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
