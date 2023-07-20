export enum AddressesRoutesPaths {
  Addresses = '/addresses'
}

export enum AddressesColumnsNames {
  Name = 'Name',
  Protocol = 'Protocol',
  CurrentFlowPairs = 'Active',
  TotalFLowPairs = 'Total',
  Servers = 'Exposed Servers'
}

// LABELS
export enum AddressesLabels {
  Section = 'Addresses',
  HTTP = ' HTTP/2',
  TCP = 'TCP',
  Description = 'Set of processes that are exposed across the Virtual Application Network.',
  MetricDestinationProcessFilter = 'All servers'
}

export enum ConnectionLabels {
  ActiveConnections = 'Live connections',
  OldConnections = 'Connections in the last 15 minutes',
  TrafficTx = 'Outbound Traffic ',
  TrafficRx = 'Inbound traffic',
  AvgByteRateRx = 'Avg. Inbound speed',
  AvgByteRateTx = 'Avg. Outbound speed'
}

export enum RequestLabels {
  Clients = 'Clients',
  Requests = 'Requests in the last 15 minutes',
  TrafficTx = 'Response Traffic ',
  TrafficRx = 'Request traffic',
  AvgByteRateRx = 'Avg. rate Responses',
  AvgByteRateTx = 'Avg. rate Requests'
}

export enum FlowPairsLabels {
  Servers = 'Exposed Servers',
  ViewDetails = 'view details'
}
