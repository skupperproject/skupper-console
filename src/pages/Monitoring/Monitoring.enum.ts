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
  TotalBytes = 'Traffic Out',
  TotalBytesIn = 'Traffic In',
  DestinationHost = 'Destination Host',
  DestinationPort = 'Destination Port',
  ConnectionStatus = 'Status',
  Connections = 'Connections',
  // nested table  Columns
  Ports = 'Ports',
  FromPort = 'Source',
  ToPort = 'Destination',
  Traffic = 'Traffic Out',
  TrafficIn = 'Traffic In',
  Latency = 'Latency Out',
  LatencyIn = 'Latency In',
  TrafficPercentage = '% Traffic Out',
  ConnectionState = 'Connection State',
}

export enum ConnectionStatus {
  SomeFlowsOpen = 'Traffic is flowing',
  AllFlowsClosed = 'No connections opened',
}

export enum QueriesMonitoring {
  GetMonitoringConnectionsByServiceName = 'monitoring-connections-by-service-name-query',
  GetMonitoringServices = 'monitoring-services-query',
  GetMonitoringNetworkStats = 'network-stats-query',
  GetMonitoringTopologyFlows = 'monitoring-topology-flows-query',
  GetMonitoringTopologyNetwork = 'monitoring-topology-network-query',
}
