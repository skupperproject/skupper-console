export enum FlowInfoColumns {
    Source = 'Source',
    RouterName = 'Router',
    SiteName = 'Site',
    RouterHostName = 'Router Hostname',
    Address = 'Address',
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

export enum FlowInfoLables {
    WarningMessage = 'This flow does not have a counter flow. There may be an error in the network',
    Connector = 'CONNECTOR',
    Listener = 'LISTENER',
    TrafficChartTitle = 'Real-time traffic data',
}
