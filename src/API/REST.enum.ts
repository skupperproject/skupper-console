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
  Terminated = 'terminated'
}

export enum Direction {
  Outgoing = 'outgoing',
  Incoming = 'incoming'
}

export enum Quantiles {
  Median = 0.5,
  Ninety = 0.9,
  NinetyFive = 0.95,
  NinetyNine = 0.99
}

// Process and Component Exposure
export enum Binding {
  Exposed = 'bound',
  Unexposed = 'unbound'
}

// Process and Component Roles
export enum Role {
  External = 'external',
  Internal = 'internal',
  Remote = 'remote'
}
