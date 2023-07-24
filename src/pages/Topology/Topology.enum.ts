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
  TopologyView = 'Topology View',
  ListView = 'List View',
  LegendGroupsItems = 'Sites',
  ShowAll = `Filter by address`,
  ShowProcessGroups = 'Group by Components',
  Process = 'process',
  Processes = 'processes',
  ServerSite = 'server site',
  ProcessExposed = 'process exposed',
  Link = 'link',
  ActiveLink = 'Active link (show metrics on)',
  Site = 'site',
  CheckboxShowSite = 'Sites',
  RotateLabel = 'Rotate',
  CheckboxShowLabel = 'Metrics',
  CheckboxShowLabelReverse = 'Reverse metrics',
  AddressFilterPlaceholderText = 'Search for Address',
  DisplayPlaceholderText = 'Display'
}

export enum TopologyURLFilters {
  Type = 'type',
  AddressId = 'addressId',
  IdSelected = 'id'
}
