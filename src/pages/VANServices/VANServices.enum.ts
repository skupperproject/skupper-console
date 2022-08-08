export enum VANServicesRoutesPaths {
    VANServices = '/vanservices',
    OverviewTable = '/vanservices/vans',
    FlowsPairs = '/vanservices/flowspairs',
    FlowPairsTable = '/table',
}

export enum VanServicesRoutesPathLabel {
    VanServices = 'vanservices',
}

// VAN SERVICES VIEW
export enum Labels {
    VanServices = 'VAN Services',
    VanServicesDescription = 'Set of services that are exposed across the Virtual application network',
}

export enum OverviewColumns {
    Name = 'Name',
    TotalListeners = 'Servers',
    TotalConnectors = 'Clients',
    CurrentFlowPairs = 'Current flow pairs',
    TotalFlowPairs = 'Total flow pairs',
}

// FLOWS PAIRS VIEW
export enum FlowsPairsLabels {
    FlowsPairs = 'Flows Pairs',
    NoCounterFlowAwailable = 'no counterflow found',
    ShowActiveFlowsPairs = 'show active items',
}

export enum DetailsColumnsNames {
    FlowPairStatus = 'Status',
    StartSite = 'From site',
    StartProcess = 'From process',
    EndSite = 'To site',
    EndProcess = 'To process',
    Traffic = 'Traffic',
    Latency = 'TTFB',
    StartTime = 'Created at',
}

// FLOW PAIR DETAIL
export enum FlowPairDetailsColumns {
    SiteName = 'Site',
    VANService = 'VAN Service',
    Protocol = 'Protocol',
    Bytes = 'Bytes',
    ByteRate = 'Byte Rate',
    Latency = 'FFTB',
    Client = 'Client',
    Server = 'Server',
    ProcessName = 'Process',
    ProcessHost = 'Process Host',
    ProcessImg = 'Process Image',
}

export enum FlowPairDetailsLabels {
    WarningMessage = 'This flow does not have a counter flow. There may be an error in the network',
    Connector = 'CONNECTOR',
    Listener = 'LISTENER',
    TrafficChartTitle = 'Bytes Rate in the last minute',
    TTFBDesc = 'Time to first byte: the time elapsed between the opening of a TCP connection between a client and a server and the receipt by the client of the first packet with payload from the server',
}
