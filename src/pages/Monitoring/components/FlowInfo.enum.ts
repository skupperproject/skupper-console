export enum FlowInfoColumns {
    IP = 'IP',
    Port = 'Port',
    Bytes = 'Bytes',
    Latency = 'Latency',
}

export enum FlowInfoLables {
    WarningMessage = 'This flow does not have a counter flow. There may be an error in the network',
    Connector = 'CONNECTOR',
    Listener = 'LISTENER',
}
