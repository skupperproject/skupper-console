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
  Description = 'A process represents running application code. On Kubernetes, a process is a pod. On Docker or Podman, a process is a container. On virtual machines or bare metal hosts',
  Details = 'Details',
  Processes = 'Processes',
  Services = 'Services',
  Process = 'Process',
  Site = 'Site',
  ProcessGroup = 'Component',
  Image = 'Image',
  Created = 'Created',
  SourceIP = 'Source IP',
  Host = 'Host',
  TrafficInOutDistribution = 'Traffic distribution',
  ChartProcessDataTrafficSeriesAxisYLabel = 'Data transfer',
  ChartProcessLatencySeriesAxisYLabel = 'Latency',
  RequestsPerSecondsSeriesAxisYLabel = 'Request rate',
  ErrorRateSeriesAxisYLabel = 'Error rate',
  TCPClients = 'TCP clients',
  TCPServers = 'TCP servers',
  HTTPClients = 'HTTP/2 clients',
  HTTPServers = 'HTTP/2 servers',
  RemoteClients = 'Remote clients',
  RemoteServers = 'Remote servers',
  Http1Requests = 'Http1 requests in the last 15 minutes',
  Http2Requests = 'Http2 requests in the last 15 minutes',
  HttpRequests = 'Http requests in the last 15 minutes',
  ExposedTitle = 'Exposed',
  Exposed = 'Yes',
  NotExposed = 'No',
  ActiveConnections = 'Live connections',
  OldConnections = 'Connections in the last 15 minutes'
}

export enum ProcessPairsColumnsNames {
  Process = 'Process',
  Title = 'Process pairs',
  Protocol = 'Protocol'
}
