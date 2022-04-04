export enum MonitoringRoutesPaths {
  Monitoring = '/monitoring',
  OverviewTable = '/monitoring/vans',
  OverviewTopology = '/monitoring/overview/topology',
  Devices = '/monitoring/devices',
}

// Routers  section
export enum SectionsStatsLabels {
  Service = 'Service',
  Router = 'Router',
}

export enum RoutersColumns {
  Name = 'Name',
  NumRouters = 'Routers',
  NumServices = 'Services',
  NumFLows = 'Connections',
  TotalBytes = 'Bytes',
}

// Services  section
export enum ServicesColumns {
  Name = 'Name',
  NumDevices = 'Devices',
  NumFLows = 'Connections',
  TotalBytes = 'TotalBytes',
}

// Devices details section
export enum DeviceColumns {
  Type = 'Type',
  DeviceName = 'Device Name',
  Hostname = 'Hostname',
  SiteName = 'Site Name',
  Protocol = 'Protocol',
  DestinationHost = 'Destination Host',
  DestinationPort = 'Destination Port',
  DeviceStatus = 'Status',
  // nested table  Columns
  Ports = 'Ports',
  FromPort = 'Source',
  ToPort = 'Destination',
  Traffic = 'Traffic',
  TrafficPercentage = '% Traffic',
  ConnectionState = 'Connection State',
}

export enum DeviceTypes {
  Listener = 'listener',
  Connector = 'connector',
}

export enum DeviceStatus {
  AllFlowsOpen = 'All flow are open',
  SomeFlowIsClosed = 'Some flow is closed',
}

export enum QueriesMonitoring {
  GetFlows = 'monitoring-flows-query',
  GetServices = 'monitoring-services',
  GetMonitoringStats = 'monitoring-stats-query',
  GetTolopologyRoutersLinks = 'monitoring-topoogy-routers-links-query',
}
