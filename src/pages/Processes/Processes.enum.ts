export enum ProcessesRoutesPaths {
  Processes = '/processes'
}

export enum QueriesProcesses {
  GetProcessesPaginated = 'get-processes-paginated-query',
  GetRemoteProcessesPaginated = 'get-remote-processes-paginated-query',
  GetProcesses = 'get-processes-query',
  GetProcess = 'get-process-query',
  GetProcessResult = 'get-process-result-query',
  GetSource = 'get-process-query',
  GetDestination = 'get-destination-process-query',
  GetProcessPairs = 'get-process-pairs',
  GetProcessPairsTx = 'get-process-pairs-tx',
  GetProcessPairsRx = 'get-process-pairs-rx',
  GetFlowPairs = 'get-process-flow-pairs',
  GetHttp = 'get-process-http-pairs',
  GetFlowPair = 'get-process-flow-pair',
  GetServicesByProcessId = 'get-services-by-process-id-query'
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
  Overview = 'Overview',
  Description = 'A process represents running application code. On Kubernetes, a process is a pod. On Docker or Podman, a process is a container. On virtual machines or bare metal hosts',
  Details = 'Details',
  ProcessPairs = 'Process pairs',
  Processes = 'Processes',
  Services = 'Services',
  Process = 'Process',
  Site = 'Site',
  ProcessGroup = 'Component',
  Image = 'Image',
  Created = 'Created',
  SourceIP = 'IP',
  Host = 'Host',
  TrafficInOutDistribution = 'Traffic distribution',
  ChartProcessLatencySeriesAxisYLabel = 'Latency',
  RequestsPerSecondsSeriesAxisYLabel = 'Request rate',
  ErrorRateSeriesAxisYLabel = 'Error rate',
  TCPClients = 'TCP clients',
  TCPServers = 'TCP servers',
  HTTPClients = 'HTTP/2 clients',
  HTTPServers = 'HTTP/2 servers',
  RemoteClients = 'Remote clients',
  RemoteServers = 'Remote servers',
  Http1Requests = 'Http1 requests',
  Http2Requests = 'Http2 requests',
  HttpRequests = 'Http requests',
  ExposedTitle = 'Exposed',
  Exposed = 'Yes',
  NotExposed = 'No',
  ActiveConnections = 'Live connections',
  OldConnections = 'Connection history',
  ProcessPairsEmptyTitle = 'No connections or requests to display',
  ProcessPairsEmptyMessage = 'As new connections or requests are established, they will be dynamically added to the table for display',
  GoToDetails = 'View details'
}

export enum ProcessPairsLabels {
  Process = 'Process',
  Title = 'Process pair details',
  Protocol = 'Protocol'
}
