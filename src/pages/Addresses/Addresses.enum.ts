export enum AddressesRoutesPaths {
    Addresses = '/addresses',
}

export enum AddressesRoutesPathLabel {
    Addresses = 'addresses',
}

// ADDRESSES VIEW
export enum AddressesLabels {
    Section = 'Addresses',
    Description = 'Set of processes that are exposed across the Virtual application network',
    CurrentConnections = 'Connections',
    ConnectionsByAddress = 'Top  5 - Active Connections By address',
    CurrentRequestResponses = 'Requests/Responses',
    RequestResponsesByAddress = 'Top  5 - Active Requests/Responses By address',
    CurrentServer = 'Servers',
}

export enum AddressesColumnsNames {
    Name = 'Name',
    TotalListeners = 'Clients',
    TotalConnectors = 'Servers',
    CurrentFlowPairs = 'Current connections',
    TotalFlowPairs = 'Total connections',
    CurrentFlowPairsHTTP = 'Current Requests/Responses',
    TotalFlowPairsHTTP = 'Total Requests/Responses',
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
    RequestsResponses = 'Requests/Responses',
    TopClientTxTraffic = 'Top 5 clients - Tx Traffic',
    TopClientRxTraffic = 'Top 5 clients - Rx Traffic',
    ViewDetails = 'view details',
}

// PROCESSES TABLE
export enum ProcessesColumnsNames {
    Site = 'Site',
    Process = 'Process',
    ProcessGroup = 'Component',
    Bytes = 'Rx Bytes',
    ByteRate = 'Rx Byte Rate',
    Host = 'Host',
    Port = 'Port',
    Image = 'Image',
}

export enum FlowLabels {
    Process = 'Process',
    Host = 'Source Host',
    Port = 'Source Port',
    DestHost = 'Destination Host',
    DestPort = 'Destination Port',
    Flow = 'Client',
    CounterFlow = 'Server',
    TTFB = 'Time to first byte',
    ByteRate = 'Byte rate',
    BytesTransferred = 'Bytes transferred',
    ByteUnacked = 'Byte unacked',
    WindowSize = 'Window Size',
}
