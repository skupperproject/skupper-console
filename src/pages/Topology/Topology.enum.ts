export enum TopologyRoutesPaths {
    Topology = '/topology',
    Overview = '/topology/Overview',
}

export enum TopologyViews {
    Sites = 'sites',
    Services = 'Services',
    ProcessGroups = 'Components',
    Processes = 'Processes',
}

export enum Labels {
    Topology = 'Network',
    LegendGroupsItems = 'Sites',
    ShowAll = 'Show all addresses',
}

export enum ConnectionsLabels {
    HTTPProtocol = 'HTTP protocol',
    TCPProtocol = 'TCP protocol',
    HTTPRequestsIn = 'HTTP Requests Received',
    HTTPRequestsOut = 'HTTP Requests Sent',
    TCPConnectionsIn = 'TCP traffic received',
    TCPConnectionsOut = 'TCP traffic sent',
    Processes = 'Processes',
}

export enum ConnectionsColumns {
    Name = 'Name',
    ByteRate = 'Byte-rate',
}

export enum TopologyURLFilters {
    Type = 'type',
    AddressId = 'addressId',
    ProcessIdSelected = 'processId',
}
