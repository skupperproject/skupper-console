export enum AddressesRoutesPaths {
    Addresses = '/addresses',
}

export enum AddressesRoutesPathLabel {
    Addresses = 'addresses',
}

// ADDRESSES VIEW
export enum AddressesLabels {
    Section = 'Addresses',
    HTTP = ' HTTP/2',
    TCP = 'TCP',
    Description = 'Set of processes that are exposed across the Virtual application network',
    ProtocolDistribution = 'Addresses Distribution by Protocol',
    CurrentConnections = 'Connections',
    ConnectionsByAddress = 'Top  5 - Active Connections By address',
    CurrentRequests = 'Requests',
    RequestsByAddress = 'Top  5 - Active Requests By address',
    CurrentServer = 'Servers',
}

export enum AddressesColumnsNames {
    Name = 'Name',
    TotalListeners = 'Clients',
    TotalConnectors = 'Servers',
    Protocol = 'Protocol',
    CurrentFlowPairs = 'Current connections',
    TotalFlowPairs = 'Total connections',
    CurrentRequests = 'Current Requests',
    TotalRequests = 'Total Requests',
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
    From = 'From',
    Server = 'Server',
    To = 'To',
    BytesTx = 'Tx Bytes',
    Download = 'Download',
    BytesRx = 'Rx Bytes',
    Upload = 'Upload',
    ByteRateTX = 'Tx Byte Rate',
    UploadRate = 'Speed U/L ',
    ByteRateRX = 'Rx Byte Rate',
    DownloadRate = 'Speed D/L',
    LatencyTx = 'Tx Latency',
    LatencyRx = 'Rx Latency',
    DownloadLatency = 'D/L Latency',
    UploadLatency = 'U/L Latency',
    RequestCompleted = 'Completed',
    ResponseTime = 'Response time',
    Host = 'Host',
    Port = 'Port',
    Method = 'Method',
    StartTime = 'Created at',
    Protocol = 'Protocol',
    ImageName = 'Image',
    Trace = 'Trace',
}

export enum FlowPairsLabels {
    Servers = 'Servers',
    Connections = 'Connections',
    Requests = 'Requests',
    RequestMethodsSummary = 'Methods summary',
    TopClientTxTraffic = 'Top 5 clients - Tx Traffic',
    TopClientRxTraffic = 'Top 5 clients - Rx Traffic',
    TopClientDownloadTraffic = 'Top 5 clients - Download Traffic',
    TopClientUploadTraffic = 'Top 5 clients - Upload Traffic',
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
    Protocol = 'Protocol',
    Process = 'Process',
    Host = 'Source Host',
    Port = 'Source Port',
    Method = 'Method',
    DestHost = 'Destination Host',
    DestPort = 'Destination Port',
    Flow = 'Client',
    CounterFlow = 'Server',
    TTFB = 'Time to first byte',
    ByteRate = 'Byte rate',
    BytesTransferred = 'Bytes transferred',
    ByteUnacked = 'Byte unacked',
    WindowSize = 'Window Size',
    DownloadLatency = 'D/L Latency',
    UploadLatency = 'U/L Latency',
}
