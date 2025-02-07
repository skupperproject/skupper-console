export const Labels = {
  Sites: 'Sites',
  Processes: 'Processes',
  Components: 'Components',
  Services: 'Services',
  Topology: 'Topology',

  Site: 'Site',
  Component: 'Component',
  Process: 'Process',
  RoutingKey: 'Routing key',
  Metrics: 'Metrics',
  RouterLinks: 'Router links',
  InLinks: 'Incoming',
  OutLinks: 'Outgoing',

  From: 'From',
  To: 'To',
  Namespace: 'Namespace',
  version: 'Version',
  Cost: 'Cost',
  Platform: 'Platform',
  LinkStatus: 'Status',
  HAShort: 'HA',
  HA: 'High availability',
  YES: 'true',
  NO: 'false',

  Details: 'Details',
  Overview: 'Overview',
  Pairs: 'Data links',
  TerminatedConnections: 'Closed connections',
  LiveConnections: 'Open connections',
  Requests: 'Http requests',
  RequestRateByMethod: 'Requests Per Second by Method',
  Responses: 'Http responses',

  Created: 'Created',
  Clients: 'Clients',
  Servers: 'Servers',
  Name: 'Name',
  RoutingKeys: 'Routing keys',
  Image: 'Image',
  SourceIP: 'IP',
  BindingState: 'Binding State',

  ViewDetails: 'View details',
  ViewFlows: 'View flows',
  ViewMetrics: 'View metrics',

  EntitiesTitle: ' Entities',
  Links: 'Links',
  Exposed: 'Bound',
  NoExposed: 'Unbound',
  SiteGroup: 'Grouping',
  Remote: 'Remote resource',
  DataLink: 'Data link',
  SiteLink: 'Router link',
  Outbound: 'Outbound',
  Inbound: 'Inbound',
  NoClients: 'No Clients',
  OpenConnections: 'Open connections',
  ConnectionActivity: 'Connection Activity',
  OldConnections: 'Connection history',
  TcpTrafficTx: 'Outbound traffic ',
  TcpTrafficRx: 'Inbound traffic',
  TcpAvgByteRateRx: 'Avg. inbound speed',
  TcpAvgByteRateTx: 'Avg. outbound speed',
  TrafficTx: 'Response Traffic ',
  TrafficRx: 'Request traffic',
  AvgByteRateRx: 'Avg. rate responses',
  AvgByteRateTx: 'Avg. rate requests',
  Listeners: 'Listeners',
  Connectors: 'Connectors',
  ListenersAndConnectors: 'Listeners and Connectors',
  IsBound: 'Bound',
  SankeyChartTitle: '',
  SankeyChartDescription: '',
  DestHost: 'Host',
  DestPort: 'Port',

  TopologyView: 'Topology view',
  ListView: 'List view',
  FindResource: `Find a resource`,
  FindProcesses: `Find processes`,
  FindSites: `Find sites`,
  FindComponents: `Find components`,
  MetricValue: 'Text',
  MetricDistribution: 'Proportional flow',
  Display: 'Display',
  DeploymentGroups: 'Deployment groups',

  Source: 'Source',
  Destination: 'Destination',
  Summary: 'Summary',
  MetricVisualizationType: 'Metric visualization type',
  LinkType: 'Link type',
  Other: 'Other',

  Errors: 'errors',
  ErrorRate: 'Error rate',
  AllSourceSites: 'All source sites',
  AllConnectedSites: 'All connected sites',
  AllSourceProcesses: 'All source processes',
  AllConnectedProcesses: 'All connected processes',
  AllProtocols: 'All protocols',

  LatencyMetric50quantile: '50th percentile',
  LatencyMetric90quantile: '90th percentile',
  LatencyMetric95quantile: '95th percentile',
  LatencyMetric99quantile: '99th percentile',
  MaxRequestRate: 'Max rps',
  RequestRateAvgTitle: 'Avg. rps',
  RequestRateCurrentTitle: 'Current rps',
  ByteRateAvgCol: 'Avg',
  ByteRateTotalCol: 'Total',
  ByteRateCurrentCol: 'Current',
  ByteRateMaxCol: 'Max',
  ByteRateMinCol: 'Min',
  TcpTraffic: 'Tcp traffic',
  TcpConnections: 'Tcp connections',
  RequestRate: 'Request rate',

  Protocols: 'Protocols',
  HTTP: ' Http/2',
  TCP: 'Tcp',

  Method: 'Method',
  Open: 'Open',
  Closed: 'Closed',
  Terminated: 'Terminated',
  Trace: 'Trace',
  Duration: 'Duration',
  Protocol: 'Protocol',
  Node: 'Node',
  ProxyNode: 'Proxy',
  Status: 'Status',
  State: 'State',
  Port: 'Port',
  Client: 'Client',
  Server: 'Server',
  Bytes: 'Data',
  BytesTransferred: 'Data transferred',
  BytesOut: 'Data Out',
  BytesIn: 'Data In',
  ByteRate: 'Byte rate',
  BytesPerSeconds: 'Bytes Per Second',
  Latency: 'Tcp latency',
  LatencyOut: 'Tcp latency Out',
  LatencyIn: 'Tcp latency In',

  ServerSite: 'Server site',
  FromClient: 'From client',
  ToServer: 'To server',
  Completed: 'Completed',
  StatusCode: 'Status',

  SearchBy: 'Search by',
  ClearAll: 'Clear all',

  NoFoundError: 'Route not found',
  HttpError: 'HTTP status error',
  ConsoleError: 'An error occurred on client side',
  NoMetricFound: 'No metrics found',
  NoBiflowFound: 'No connections or requests to display',

  fetchDataDescription: 'The data for the service network is being retrieved. One moment please...',
  ProcessDescription:
    'A process represents running application code.<br>On Kubernetes, a process is a pod. On Docker or Podman, a process is a container. On virtual machines or bare metal hosts',
  ComponentsDescription:
    'A component is a logical application unit with specific responsibilities, implemented by processes across multiple sites.',
  ServicesDescription:
    'List of routing keys that contain at least one listener.<br>A routing key matches listeners, which connect local endpoints to remote connectors.',
  SiteDescription:
    'A site is a location where components of your application are running and they are linked together to form a network',
  TopologyDescription:
    'The network topology refers to the manner in which the links and nodes of a network are arranged to relate to each other',
  NoMetricFoundDescription:
    'No metrics are currently accessible or meet the filter criteria. Please modify all filters, then attempt the operation again.',
  NoBiflowFoundDescription:
    'As new connections or requests are established, they will be dynamically added to the table for display',
  ByteRateDataOutDescription: 'Client Role',
  ByteRateDataInDescription: 'Server Role',
  LatencyOutDescription: 'Connector Request to First Server Response',
  LatencyInDescription: 'Listener Request to First Client Response'
} as const; // makes sure that all values are treated as literal types
