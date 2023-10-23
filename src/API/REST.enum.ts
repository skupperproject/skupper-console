export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export enum AvailableProtocols {
  Tcp = 'tcp',
  Http = 'http1',
  Http2 = 'http2',
  AllHttp = 'http.*'
}

export enum TcpStatus {
  Active = 'active',
  Terminated = 'closed'
}

export enum FlowDirection {
  Outgoing = 'outgoing',
  Incoming = 'incoming'
}

export enum Quantiles {
  Median = 0.5,
  Ninety = 0.9,
  NinetyFive = 0.95,
  NinetyNine = 0.99
}
