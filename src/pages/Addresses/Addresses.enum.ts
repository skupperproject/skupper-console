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
    ProtocolDistribution = 'Distribution of addresses by protocol',
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
    BytesTx = 'Outbound',
    Download = 'Download',
    BytesRx = 'Inbound',
    Upload = 'Upload',
    ByteRateTX = 'Tx speed',
    UploadRate = 'Speed U/L ',
    ByteRateRX = 'Rx speed',
    DownloadRate = 'Speed D/L',
    LatencyAvgTx = 'Avg Out Latency',
    LatencyMinTx = 'Tx Min Latency',
    LatencyMaxTx = 'Tx Max Latency',
    LatencyAvgRx = 'Avg In Latency',
    LatencyMinRx = 'Rx Min Latency',
    LatencyMaxRx = 'Rx Max Latency',
    DownloadLatency = 'D/L Latency',
    UploadLatency = 'U/L Latency',
    RequestCompleted = 'Completed',
    ResponseTime = 'Response time',
    Host = 'Host',
    Port = 'Port',
    Method = 'Method',
    StatusCode = 'Status',
    StartTime = 'Created at',
    Protocol = 'Protocol',
    ImageName = 'Image',
    Trace = 'Trace',
    Flows = 'Flows',
}

export enum FlowPairsLabels {
    Servers = 'Servers',
    ActiveConnections = 'Live connections',
    ActiveRequests = 'Active Requests',
    Requests = 'Requests',
    RequestMethodsSummary = 'HTTP Methods summary in the last 5 minutes',
    StatusCodeSummary = 'HTTP Status Codes distribution in the last 5 minutes',
    TopClientTxTraffic = 'Outbound traffic in the last 5 minutes - Top 10 servers',
    TopClientRxTraffic = 'Inbound traffic in the last 5 minutes - Top 10 servers',
    TopClientDownloadTraffic = 'Distribution of the traffic received by Servers',
    TopClientUploadTraffic = 'Distribution of the traffic sent by Servers',
    ViewDetails = 'view details',
    TrafficTx = 'Outbound Traffic ',
    TrafficRx = 'Inbound traffic',
    AvgByteRateRx = 'Avg speed In',
    AvgByteRateTx = 'Avg speed Out',
    GoToTopology = 'Go to the network view',
}

// PROCESSES TABLE
export enum ProcessesColumnsNames {
    Site = 'Site',
    Process = 'Process',
    ProcessGroup = 'Component',
    BytesTx = 'Tx Bytes',
    BytesRx = 'Rx Bytes',
    ByteRateTx = 'Tx speed',
    ByteRateRx = 'Rx speed',
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
