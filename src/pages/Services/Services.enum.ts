export enum ServicesRoutesPaths {
  Services = '/routingkeys'
}

export enum QueriesServices {
  GetBiFlow = 'services-biFlow-query',
  GetTransportFlows = 'services-transport-flows-query',
  GetApplicationFlows = 'services-application-flows-query',
  GetProcessesByService = 'processes-by-service-query',
  GetTcpByteRateByService = 'tcp-byterate-by-service-query',
  GetServices = 'services-query',
  GetService = 'service-query',
  GetListeners = 'listeners-query',
  GetConnectors = 'connectors-query',
  GetPrometheusActiveFlows = 'services-get-prometheus-active-flows',
  GetPrometheusTcpTotalFlows = 'services-get-tcp-prometheus-total-flows',
  GetPrometheusHttpTotalFlows = 'services-get-http-prometheus-total-flows',
  GetPrometheusPairsByService = 'services-get-prometheus-pair-by-service',
  GetProcessPairsByService = 'services-get-process-pairs-by-service'
}

// LABELS
export enum ServicesLabels {
  Section = 'Routing Keys',
  HTTP = ' HTTP/2',
  TCP = 'TCP',
  Description = 'Collection of processes (servers) that are exposed across the Application network, along with their respective connections to the processes (clients) they communicate with',
  NoMetricSourceProcessFilter = 'No Clients',
  OpenConnections = 'Open connections',
  OldConnections = 'Connection history',
  TcpTrafficTx = 'Outbound traffic ',
  TcpTrafficRx = 'Inbound traffic',
  TcpAvgByteRateRx = 'Avg. inbound speed',
  TcpAvgByteRateTx = 'Avg. outbound speed',
  Requests = 'Requests',
  TrafficTx = 'Response Traffic ',
  TrafficRx = 'Request traffic',
  AvgByteRateRx = 'Avg. rate responses',
  AvgByteRateTx = 'Avg. rate requests',
  Overview = 'Overview',
  Pairs = 'Pairs',
  Listeners = 'Listeners',
  Connectors = 'Connectors',
  ListenersAndConnectors = 'Listeners and Connectors',
  IsBound = 'Bound',
  SankeyChartTitle = '',
  SankeyChartDescription = '',
  Name = 'Name',
  TransportProtocol = 'Transport protocol',
  ApplicationProtocols = 'Application protocols',
  DestHost = 'Host',
  DestPort = 'Port',
  Site = 'Site',
  TotalBiFlows = 'Total',
  Processes = 'Processes'
}
