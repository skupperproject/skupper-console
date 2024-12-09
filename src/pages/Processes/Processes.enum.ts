export enum ProcessesRoutesPaths {
  Processes = '/processes'
}

export enum QueriesProcesses {
  GetProcessesPaginated = 'get-processes-paginated-query',
  GetProcesses = 'get-processes-query',
  GetProcess = 'get-process-query',
  GetProcessResult = 'get-process-result-query',
  GetProcessPairs = 'get-process-pairs',
  GetProcessPair = 'get-process-pair',
  GetProcessPairsResult = 'get-process-pairs-result'
}

export enum ProcessesLabels {
  Section = 'Processes',
  Overview = 'Overview',
  Description = 'A process represents running application code.<br>On Kubernetes, a process is a pod. On Docker or Podman, a process is a container. On virtual machines or bare metal hosts',
  Details = 'Details',
  ProcessPairs = 'Data links',
  Processes = 'Processes',
  Services = 'Routing keys',
  Process = 'Process',
  Site = 'Site',
  Component = 'Component',
  Image = 'Image',
  Created = 'Created',
  SourceIP = 'IP',
  Host = 'Node',
  TrafficInOutDistribution = 'Traffic distribution',
  ChartProcessLatencySeriesAxisYLabel = 'Latency',
  RequestsPerSecondsSeriesAxisYLabel = 'Request rate',
  ErrorRateSeriesAxisYLabel = 'Error rate',
  Clients = 'Clients',
  Servers = 'Servers',
  Http2Requests = 'Http2 requests',
  BindingState = 'Binding State',
  IsExposed = 'Exposed',
  IsNotExposed = 'Unexposed',
  Requests = 'Requests',
  OpenConnections = 'Open connections',
  TerminatedConnections = 'Connection history',
  ProcessPairsEmptyTitle = 'No connections or requests to display',
  ProcessPairsEmptyMessage = 'As new connections or requests are established, they will be dynamically added to the table for display',
  GoToDetailsLink = 'View details',
  Title = 'Pair details',
  Protocol = 'Protocol',
  TransportProtocol = 'Transport protocol',
  ApplicationProtocols = 'Application protocols',
  Bytes = 'Bytes',
  ByteRate = 'Byterate',
  Latency = 'Latency',
  Name = 'Name',
  ByteRateRx = 'Byte rate In',
  Exposed = 'Exposed'
}
