export enum MonitoringRoutesPaths {
  Monitoring = '/monitoring',
  VANs = '/monitoring/vans',
  Devices = '/monitoring/devices',
}

// VAN  section
export enum VansColumns {
  Name = 'name',
  NumDevices = 'Devices',
  NumFLows = 'Flows',
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
  // nested table  Columns
  Ports = 'Ports',
  FromPort = 'Source',
  ToPort = 'Destination',
  Traffic = 'Traffic',
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
}
