export enum RestResources {
  Sites = 'sites',
  RouterLinks = 'routerlinks',
  Components = 'components',
  Processes = 'processes',
  Services = 'services',
  Listeners = 'listeners',
  Connectors = 'connectors',
  TcpConnections = 'connections',
  HttpRequests = 'applicationflows',
  SiteDataLinks = 'sitepairs',
  ComponentDataLinks = 'componentpairs',
  ProcessDataLinks = 'processpairs'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export enum Protocols {
  Tcp = 'tcp',
  Http = 'http1',
  Http2 = 'http2'
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

// Listener routing model: a single-key listener has one routing key, a multi-key listener has several
export enum ListenerRoutingModel {
  SingleKey = 'single-key',
  MultiKey = 'multi-key'
}

// Strategy used by a multi-key listener to choose among its routing keys
export enum ListenerStrategy {
  NotApplicable = 'not-applicable',
  Priority = 'priority',
  Weighted = 'weighted'
}
