export enum MonitoringRoutesPaths {
  Monitoring = '/monitoring',
  OverviewTable = '/monitoring/vans',
  Connections = '/monitoring/connections',
  ConnectionsTopology = '/topology',
  ConnectionsTable = '/table',
}

export enum MonitoringRoutesPathLabel {
  Monitoring = 'Monitoring',
}

// Routers  section
export enum SectionsStatsLabels {
  Service = 'Service',
  Router = 'Router',
  Link = 'Link',
}

export enum ConnectionsNavMenu {
  Topology = 'Topology',
  Table = 'Details',
}

export enum OverviewColumns {
  Name = 'Name',
  NumRouters = 'Routers',
  NumServices = 'Services',
  NumConnections = 'Flows',
  NumLinks = 'Links',
  TotalBytes = 'Traffic',
}

export enum RoutersColumns {
  Name = 'Name',
  NumRouters = 'Routers',
  NumServices = 'Services',
  NumFLows = 'Flows',
  TotalBytes = 'Traffic',
}

export enum LinksColumns {
  RouterStart = 'From',
  RouterEnd = 'To',
  Cost = 'Cost',
  Mode = 'Mode',
  Direction = 'Direction',
}

// Services  section
export enum ServicesColumns {
  Name = 'Name',
  RoutersAssociated = 'Routers Flows',
  NumDevices = 'Devices',
  NumFLows = 'Connections',
  TotalBytes = 'Traffic',
}

// Connection details section
export enum ConnectionColumns {
  To = 'To',
  Hostname = 'Hostname',
  From = 'From',
  Protocol = 'Protocol',
  TotalBytes = 'Traffic',
  TotalBytesIn = 'Traffic',
  DestinationHost = 'Destination Host',
  DestinationPort = 'Destination Port',
  ConnectionStatus = 'Status',
  Connections = 'Connections',
  // nested table  Columns
  Ports = 'Ports',
  Traffic = 'Traffic',
  TrafficIn = 'Traffic',
  Latency = 'Latency',
  LatencyIn = 'Latency',
  TrafficPercentage = '%',
}

export enum ConnectionStatus {
  SomeFlowsOpen = 'Traffic is flowing',
  AllFlowsClosed = 'No connections opened',
}
