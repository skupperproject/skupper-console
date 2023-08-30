export enum AddressesRoutesPaths {
  Services = '/services'
}

export enum AddressesColumnsNames {
  Name = 'Address',
  Protocol = 'Protocol',
  CurrentFlowPairs = 'Active',
  TotalFLowPairs = 'Total',
  Servers = 'Exposed servers'
}

// LABELS
export enum AddressesLabels {
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
  SankeyChartTitle = 'Resource distribution flow diagram'
}
