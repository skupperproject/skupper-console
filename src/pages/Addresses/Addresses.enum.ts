export enum AddressesRoutesPaths {
    Addresses = '/addresses',
    FlowsPairs = '/addresses/flowpairs',
}

export enum AddressesRoutesPathLabel {
    Addresses = 'addresses',
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
    ServerSite = 'Server Site',
    Process = 'process',
    Client = 'Client',
    Server = 'Server',
    BytesTx = 'Tx Bytes',
    BytesRx = 'Rx Bytes',
    ByteRateTX = 'Tx Byte Rate',
    ByteRateRX = 'Rx Byte Rate',
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
    Bytes = 'Rx Bytes',
    ByteRate = 'Rx Byte Rate',
    Host = 'Host',
    Port = 'Port',
    Latency = 'TTFB',
    Image = 'Image',
    Protocol = 'Protocol',
}
