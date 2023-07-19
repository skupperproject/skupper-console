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
  Description = 'An address is a string identifier that binds clients and servers. Addresses are the basis for routing service traffic across sites.',
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
  ViewDetails = 'view details',
  GoToTopology = 'Go to the Topology view'
}
