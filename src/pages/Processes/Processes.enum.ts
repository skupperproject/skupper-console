export enum ProcessesRoutesPaths {
  Processes = '/processes'
}

export enum ProcessesTableColumns {
  Name = 'Name',
  Site = 'Site',
  Component = 'Component',
  ByteRateRx = 'Rx byte rate',
  Exposed = 'Exposed',
  Created = 'Created'
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
  ChartProcessDataTrafficSeriesAxisYLabel = 'Bytes per second',
  ChartProcessLatencySeriesAxisYLabel = 'Latency',
  RequestsPerSecondsSeriesAxisYLabel = 'Request rate',
  ErrorRateSeriesAxisYLabel = 'Error rate',
  TCPClients = 'TCP Clients',
  TCPServers = 'TCP Servers',
  HTTPClients = 'HTTP/2 Clients',
  HTTPServers = 'HTTP/2 Servers',
  RemoteClients = 'Remote Clients',
  RemoteServers = 'Remote Servers',
  Http1Requests = 'Http1 requests in the last 15 minutes',
  Http2Requests = 'Http2 requests in the last 15 minutes',
  HttpRequests = 'Http requests in the last 15 minutes',
  GoToTopology = 'Go to the Topology view',
  ByteRateAvgCol = 'avg',
  ByteRateTotalCol = 'total',
  ByteRateCurrentCol = 'current',
  ByteRateMaxCol = 'max',
  ExposedTitle = 'Exposed',
  Exposed = 'yes',
  NotExposed = 'no',
  ActiveConnections = 'Live connections',
  OldConnections = 'Connections in the last 15 minutes'
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
