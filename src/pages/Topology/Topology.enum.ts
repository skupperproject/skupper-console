export enum TopologyRoutesPaths {
  Topology = '/topology',
  Overview = '/topology/Overview'
}

export enum QueriesTopology {
  GetProcessesPairs = 'get-topology-processes-pairs-query',
  GetFlowPairsByServiceResult = 'get-topology-flow-pairs-by-service-result-query',
  GetBytesByProcessPairs = 'get-bytes-process-pairs-result-query',
  GetByteRateByProcessPairs = 'get-byte-rate-process-pairs-result-query',
  GetLatencyByProcessPairs = 'get-latency-process-pairs-result-query',
  GetProcessGroupsLinks = 'get-topology-process-groups-links-query',
  GetProcessGroupMetrics = 'get-topology-process-group-metrics-query'
}

export enum TopologyViews {
  Sites = 'Sites',
  ProcessGroups = 'Components',
  Processes = 'Processes'
}

export enum TopologyLabels {
  Topology = 'Topology',
  Description = 'The network topology refers to the manner in which the links and nodes of a network are arranged to relate to each other',
  TopologyView = 'Topology view',
  ListView = 'List view',
  LegendGroupsItems = 'Sites',
  ShowAll = `Filter by service`,
  ShowProcessGroups = 'Group by components',
  Process = 'Process',
  Processes = 'Processes',
  ServerSite = 'Server site',
  ProcessExposed = 'Process exposed',
  Link = 'link',
  ActiveLink = 'Active link (show metrics on)',
  Site = 'site',
  CheckboxShowSite = 'Site',
  RotateLabel = 'Rotate labels',
  CheckboxShowProtocol = 'Protocol',
  CheckboxShowTotalBytes = 'Total Traffic',
  CheckboxShowCurrentByteRate = 'Byterate (live)',
  CheckboxShowLatency = 'Latency (live)',
  CheckboxShowLabelReverse = 'Inbound metrics',
  ServiceFilterPlaceholderText = 'Search for service',
  DisplayPlaceholderText = 'Display'
}

export enum TopologyURLQueyParams {
  Type = 'type',
  ServiceId = 'serviceId',
  IdSelected = 'id'
}
