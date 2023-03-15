export enum AddressesRoutesPaths {
  Addresses = '/addresses'
}

export enum AddressesRoutesPathLabel {
  Addresses = 'addresses'
}

// ADDRESSES VIEW
export enum AddressesLabels {
  Section = 'Addresses',
  HTTP = ' HTTP/2',
  TCP = 'TCP',
  Description = 'Set of processes that are exposed across the Virtual application network',
  ProtocolDistribution = 'TCP vs HTTP',
  CurrentConnections = 'Connections',
  ConnectionsByAddress = 'Top  5 - Active Connections By address',
  CurrentRequests = 'Requests',
  RequestsByAddress = 'Top  5 - Active Requests By address',
  CurrentServer = 'Servers'
}

export enum AddressesColumnsNames {
  Name = 'Name',
  TotalListeners = 'Clients',
  TotalConnectors = 'Servers',
  Protocol = 'Protocol',
  CurrentFlowPairs = 'Current connections',
  TotalFlowPairs = 'Total connections',
  CurrentRequests = 'Current Requests',
  TotalRequests = 'Total Requests'
}

// FLOWS PAIRS VIEW
export enum FlowPairsLabelsTcp {
  Servers = 'Servers',
  ActiveConnections = 'Live connections',
  TopClientTxTraffic = 'Top 10 servers Outbound traffic in the last 5 minutes',
  TopClientRxTraffic = 'Top 10 servers Inbound traffic in the last 5 minutes',
  ViewDetails = 'view details',
  TrafficTx = 'Outbound Traffic ',
  TrafficRx = 'Inbound traffic',
  AvgByteRateRx = 'Average Inbound speed',
  AvgByteRateTx = 'Average Outbound speed'
}

export enum FlowPairsLabelsHttp {
  Servers = 'Servers',
  Requests = 'Requests',
  RequestMethodsSummary = 'HTTP Methods summary in the last 20 minutes',
  StatusCodeSummary = 'HTTP Status Codes distribution in the last 20 minutes',
  TopClientTxTraffic = 'Top 10 servers Outbound traffic in the last 20 minutes',
  TopClientRxTraffic = 'Top 10 servers Inbound traffic in the last 20 minutes',
  TopResponseAvgLatency = 'Top 10 Client latency response: Average time in the last 20 minutes',
  TopRequestAvgLatency = 'Top 10 Server latency request: Average time in the last 20 minutes',
  TrafficTx = 'Response Traffic ',
  TrafficRx = 'Request traffic',
  AvgByteRateRx = 'Avg rate Responses',
  AvgByteRateTx = 'Avg rate Requests'
}

export enum FlowPairsLabel {
  ViewDetails = 'view details',
  GoToTopology = 'Go to the network view'
}

// PROCESSES TABLE
export enum ProcessesColumnsNames {
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

export enum FlowLabels {
  Protocol = 'Protocol',
  Process = 'Process',
  Host = 'Source Host',
  Port = 'Source Port',
  Method = 'Method',
  DestHost = 'Destination Host',
  DestPort = 'Destination Port',
  Flow = 'Client',
  CounterFlow = 'Server',
  ByteRate = 'Byte rate',
  BytesTransferred = 'Bytes transferred',
  ByteUnacked = 'Byte unacked',
  WindowSize = 'Window Size',
  Latency = 'Latency',
  Duration = 'Duration'
}
