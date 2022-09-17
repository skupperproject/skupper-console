export enum AddressesRoutesPaths {
    VANServices = '/addresses',
    OverviewTable = '/addresses/vans',
    FlowsPairs = '/addresses/flowpairs',
    FlowPairsTable = '/table',
}

export enum AddressesRoutesPathLabel {
    Addresses = 'addresses',
}

export enum AddressesDescriptions {
    FlowPairsDesc = 'Sequence of packets from a source to a destination',
    TTFBDesc = 'Time to first byte: the time elapsed between the opening of a TCP connection between a client and a server and the receipt by the client of the first packet with payload from the server',
}

// ADDRESSES VIEW
export enum Labels {
    VanServices = 'Addresses',
    VanServicesDescription = 'Set of services that are exposed across the Virtual application network',
    Connections = 'Connections',
}

export enum AddressesColumns {
    Name = 'Name',
    TotalListeners = 'Clients',
    TotalConnectors = 'Servers',
    CurrentFlowPairs = 'Current connections',
    TotalFlowPairs = 'Total connections',
}

// FLOWS PAIRS VIEW
export enum FlowPairsColumnsNames {
    Status = 'Status',
    FlowForward = 'From Client',
    FlowReverse = 'To Server',
    Site = 'Site',
    Process = 'process',
    Bytes = 'Bytes',
    ByteRate = 'Byte Rate',
    Host = 'Host',
    Port = 'Port',
    MaxTTFB = ' max TTFB',
    StartTime = 'Created at',
    Protocol = 'Protocol',
    ImageName = 'Image',
}

export enum FlowPairDetailsLabels {
    WarningMessage = 'This flow does not have a counter flow. There may be an error in the network',
    Connector = 'CONNECTOR',
    Listener = 'LISTENER',
    TrafficChartTitle = 'Bytes Rate in the last minute',
    Servers = 'Servers',
    Connections = 'Connections',
}

// PROCESSES TABLE
export enum ProcessesColumnsNames {
    Site = 'Site',
    Process = 'process',
    Bytes = 'Bytes',
    ByteRate = 'Byte Rate',
    Host = 'Host',
    Port = 'Port',
    Latency = 'TTFB',
    Image = 'Image',
    Protocol = 'Protocol',
}
