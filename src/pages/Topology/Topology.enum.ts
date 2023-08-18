export enum TopologyRoutesPaths {
  Topology = '/topology',
  Overview = '/topology/Overview'
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
  RotateLabel = 'Rotate metrics',
  CheckboxShowProtocol = 'Protocol',
  CheckboxShowTotalBytes = 'Total Traffic',
  CheckboxShowCurrentByteRate = 'Byterate (live)',
  CheckboxShowLatency = 'Latency (live)',
  CheckboxShowLabelReverse = 'Reverse metrics',
  AddressFilterPlaceholderText = 'Search for service',
  DisplayPlaceholderText = 'Display'
}

export enum TopologyURLFilters {
  Type = 'type',
  AddressId = 'addressId',
  IdSelected = 'id'
}
