export enum AddressesRoutesPaths {
    Addresses = '/addresses',
    FlowsPairs = '/addresses/flowpairs',
}

export enum AddressesRoutesPathLabel {
    Addresses = 'addresses',
}

export enum AddressesDescriptions {
    FlowPairsDesc = 'Sequence of packets from a source to a destination',
    TTFBDesc = 'Time to first byte: the time elapsed between the opening of a TCP connection between a client and a server and the receipt by the client of the first packet with payload from the server',
}

// ADDRESSES VIEW
export enum AddressesLabels {
    Section = 'Addresses',
    Description = 'Set of services that are exposed across the Virtual application network',
    CurrentConnections = 'Connections',
    ConnectionsByAddress = 'Top  5 - Connections By address',
    TopConnections = 'Top 5 - Total connections',
    TopServer = 'Top  5 - Servers By Address',
    CurrentServer = 'Servers',
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
    StartTime = 'Created at',
    Protocol = 'Protocol',
    ImageName = 'Image',
}

export enum FlowPairsLabels {
    Servers = 'Servers',
    Connections = 'Connections',
    FlowPairsDistributionTitle = 'Top 5 clients',
}

// PROCESSES TABLE
export enum ProcessesColumnsNames {
    Site = 'Site',
    Process = 'Process',
    ProcessGroup = 'Group',
    Bytes = 'Bytes',
    ByteRate = 'Byte Rate',
    Host = 'Host',
    Port = 'Port',
    Latency = 'TTFB',
    Image = 'Image',
    Protocol = 'Protocol',
}
