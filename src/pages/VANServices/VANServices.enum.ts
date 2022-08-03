export enum MonitoringRoutesPaths {
    Monitoring = '/monitoring',
    OverviewTable = '/monitoring/vans',
    Connections = '/monitoring/connections',
    ConnectionsTable = '/table',
}

export enum MonitoringRoutesPathLabel {
    Monitoring = 'Monitoring',
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
    NumFlowsActive = 'Active flows',
    NumFLows = 'Flows',
}

// CONNECTIONS VIEW
export enum ConnectionsLabels {
    Flows = 'Flows',
    NoCounterFlowAwailable = 'no counterflow found',
}

export enum DetailsColumnsNames {
    ConnectionStatus = 'Status',
    Connections = 'Flows',
    Traffic = 'Traffic',
    Latency = 'TTFB',
    StartTime = 'Created at',
}
