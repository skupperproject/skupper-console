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
export enum ConnectionsNavMenu {
    Topology = 'Topology',
    Table = 'Details',
}

// Services  section
export enum ServicesColumns {
    Name = 'Name',
    TotalListeners = 'Listerners',
    TotalConnectors = 'Connectors',
    NumFlowsActive = 'Active flows',
    NumFLows = 'Flows',
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
}

export enum ConnectionStatus {
    SomeFlowsOpen = 'Traffic is flowing',
    AllFlowsClosed = 'No connections opened',
}
