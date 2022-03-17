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

export enum DeviceTypes {
  Listener = 'listener',
  Connector = 'connector',
}

export enum DeviceStatus {
  InProgress = 'In progress',
  Connected = 'Connected',
}
