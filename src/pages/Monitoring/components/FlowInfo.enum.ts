export enum FlowInfoColumns {
    Source = 'Source',
    RouterName = 'Router',
    Namespace = 'Namespace',
    HostName = 'Hostname',
    Address = 'Address',
    Protocol = 'Protocol',
    Bytes = 'Bytes',
    ByteRate = 'Byte Rate',
    Latency = 'FFTB',
    Client = 'Client',
    Server = 'Server',
}

export enum FlowInfoLables {
    WarningMessage = 'This flow does not have a counter flow. There may be an error in the network',
    Connector = 'CONNECTOR',
    Listener = 'LISTENER',
}
