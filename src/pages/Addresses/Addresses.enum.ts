export enum AddressesRoutesPaths {
  Addresses = '/addresses'
}

// ADDRESSES VIEW
export enum AddressesLabels {
  Section = 'Addresses',
  HTTP = ' HTTP/2',
  TCP = 'TCP',
  Description = 'Set of processes that are exposed across the Virtual application network',
  MetricDestinationProcessFilter = 'All servers'
}

export enum AddressesColumnsNames {
  Name = 'Name',
  Protocol = 'Protocol',
  CurrentFlowPairs = 'Active',
  TotalFLowPairs = 'Total',
  Servers = 'Servers'
}

// FLOWS PAIRS VIEW
export enum FlowPairsLabelsTcp {
  ActiveConnections = 'Live connections',
  OldConnections = 'Connections in the last 15 minutes',
  TrafficTx = 'Outbound Traffic ',
  TrafficRx = 'Inbound traffic',
  AvgByteRateRx = 'Avg. Inbound speed',
  AvgByteRateTx = 'Avg. Outbound speed'
}

export enum FlowPairsLabelsHttp {
  Clients = 'Clients',
  Requests = 'Requests in the last 15 minutes',
  TrafficTx = 'Response Traffic ',
  TrafficRx = 'Request traffic',
  AvgByteRateRx = 'Avg. rate Responses',
  AvgByteRateTx = 'Avg. rate Requests'
}

export enum FlowPairsLabels {
  Servers = 'Servers',
  ViewDetails = 'view details',
  GoToTopology = 'Go to the Topology view'
}

// PROCESSES TABLE
export enum ServerColumnsNames {
  Site = 'Site',
  Process = 'Process',
  ProcessGroup = 'Component',
  BytesTx = 'Tx Bytes',
  BytesRx = 'Rx Bytes',
  ByteRateTx = 'Tx rate',
  ByteRateRx = 'Rx rate',
  Host = 'Host',
  Port = 'Port',
  Image = 'Image'
}
