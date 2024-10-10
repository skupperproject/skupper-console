export enum ServicesRoutesPaths {
  Services = '/services'
}

export enum QueriesServices {
  GetBiFlow = 'services-biFlow-query',
  GetTransportFlows = 'services-transport-flows-query',
  GetApplicationFlows = 'services-application-flows-query',
  GetProcessesByService = 'processes-by-service-query',
  GetTcpByteRateByService = 'tcp-byterate-by-service-query',
  GetServices = 'services-query',
  GetService = 'service-query',
  GetPrometheusActiveFlows = 'services-get-prometheus-active-flows',
  GetPrometheusTcpTotalFlows = 'services-get-tcp-prometheus-total-flows',
  GetPrometheusHttpTotalFlows = 'services-get-http-prometheus-total-flows',
  GetResourcePairsByService = 'services-get-resource-pair-by-service',
  GetProcessPairsByService = 'services-get-process-pairs-by-service'
}

// LABELS
export enum ServicesLabels {
  Section = 'Services',
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
  Servers = 'Servers',
  SankeyChartTitle = 'Pairs relationship',
  SankeyChartDescription = 'Visualizing relationships and the distribution',
  RoutingKey = 'Routing key',
  TransportProtocol = 'Transport protocol',
  ApplicationProtocols = 'Application protocols',
  TotalBiFlows = 'Total'
}
