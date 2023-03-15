export enum TopologyRoutesPaths {
  Topology = '/topology',
  Overview = '/topology/Overview'
}

export enum TopologyViews {
  Sites = 'Sites',
  ProcessGroups = 'Components',
  Processes = 'Processes'
}

export enum Labels {
  Topology = 'Network',
  LegendGroupsItems = 'Sites',
  ShowAll = 'Show all addresses',
  ShowProcessGroups = 'Group by components'
}

export enum ConnectionsLabels {
  HTTPProtocol = 'HTTP protocol',
  TCPProtocol = 'TCP protocol',
  HTTPRequestsIn = 'HTTP Requests Received',
  HTTPRequestsOut = 'HTTP Requests Sent',
  TCPConnectionsIn = 'Traffic received',
  TCPConnectionsOut = 'Traffic sent',
  Processes = 'Processes'
}

export enum ConnectionsColumns {
  Name = 'Name',
  ByteRate = 'Rate',
  FlowPairs = 'Flow pairs'
}

export enum TopologyURLFilters {
  Type = 'type',
  AddressId = 'addressId',
  IdSelected = 'id'
}
