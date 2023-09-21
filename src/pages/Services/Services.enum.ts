export enum ServicesRoutesPaths {
  Services = '/services'
}

export enum QueriesServices {
  GetFlowPair = 'services-flowpair-query',
  GetFlowPairsByService = 'services-flowpairs-by-service-query',
  GetProcessesByService = 'processes-by-service-query',
  GetTcpByteRateByService = 'tcp-byterate-by-service-query',
  GetServices = 'services-query',
  GetPrometheusActiveFlows = 'services-get-prometheus-active-flows',
  GetPrometheusTcpTotalFlows = 'services-get-tcp-prometheus-total-flows',
  GetPrometheusHttpTotalFlows = 'services-get-http-prometheus-total-flows',
  GetResourcePairsByService = 'services-get-resource-pair-by-service',
  GetProcessPairsByService = 'services-get-process-pairs-by-service'
}

export enum ServicesColumnsNames {
  Name = 'Address',
  Protocol = 'Protocol',
  CurrentFlowPairs = 'Active',
  TotalFLowPairs = 'Total',
  Servers = 'Exposed servers'
}

// LABELS
export enum ServicesLabels {
  Section = 'Services',
  HTTP = ' HTTP/2',
  TCP = 'TCP',
  Description = 'Set of processes that are exposed across the Virtual Application Network.',
  MetricDestinationProcessFilter = 'All servers'
}

export enum ConnectionLabels {
  ActiveConnections = 'Live connections',
  OldConnections = 'Connection history',
  TrafficTx = 'Outbound traffic ',
  TrafficRx = 'Inbound traffic',
  AvgByteRateRx = 'Avg. inbound speed',
  AvgByteRateTx = 'Avg. outbound speed'
}

export enum RequestLabels {
  Clients = 'Clients',
  Requests = 'Requests',
  TrafficTx = 'Response Traffic ',
  TrafficRx = 'Request traffic',
  AvgByteRateRx = 'Avg. rate responses',
  AvgByteRateTx = 'Avg. rate requests'
}

export enum FlowPairsLabels {
  Overview = 'Overview',
  Servers = 'Exposed servers',
  SankeyChartTitle = 'Distribution of flows',
  SankeyChartDescription = 'Sankey diagram to visualize the relationships between processes and/or sites'
}
