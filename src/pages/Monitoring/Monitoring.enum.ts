export enum MonitoringRoutesPaths {
  Monitoring = '/monitoring',
  VANs = '/monitoring/vans',
  Devices = '/monitoring/devices',
}

// Routers  section
export enum RoutersColumns {
  Name = 'name',
  NumVans = 'Vans',
  NumFLows = 'Connections',
  TotalBytes = 'Bytes',
}

// VAN  section
export enum VansColumns {
  Name = 'name',
  NumDevices = 'Devices',
  NumFLows = 'Connections',
  TotalBytes = 'TotalBytes',
}

// VAN details section
export enum DeviceLabels {
  FlowDetails = 'connection',
}

export enum DeviceColumns {
  Type = 'Type',
  DeviceName = 'Device Name',
  Hostname = 'Hostname',
  SiteName = 'Site Name',
  Protocol = 'Protocol',
  VanAddress = 'VAN Address',
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
  InProgress = 'In progress',
  Connected = 'Connected',
}

export enum QueriesMonitoring {
  GetFlows = 'monitoring-query',
  GetVans = 'monitoring-vans',
  GetMonitoringStats = 'monitoring-stats-query',
}
