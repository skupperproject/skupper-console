export enum MonitoringRoutesPaths {
  Monitoring = '/monitoring',
  VANs = '/monitoring/vans',
  Devices = '/monitoring/devices',
}

export enum Columns {
  Type = 'Type',
  DeviceName = 'Device Name',
  Hostname = 'Hostname',
  SiteName = 'Site Name',
  Protocol = 'Protocol',
  VanAddress = 'VAN Address',
  DestinationHost = 'Destination Host',
  DestinationPort = 'Destination Port',
}

export enum VansColumns {
  Name = 'name',
  NumDevices = 'Devices',
  NumFLows = 'Flows',
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
