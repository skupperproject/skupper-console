export enum TopologyRoutesPaths {
  Topology = '/topology',
  Overview = '/topology/Overview'
}

export enum QueriesPairs {
  GetSitesPairs = 'get-sites-pairs-query',
  GetProcessesPairs = 'get-processes-pairs-query',
  GetComponentsPairs = 'get-components-pairs-query',
  GetMetricsByPairs = 'get-metrics-by-pairs-query'
}

export enum TopologyViews {
  Sites = 'Sites',
  Components = 'Components',
  Processes = 'Processes'
}

export enum TopologyLabels {
  Topology = 'Topology',
  Description = 'The network topology refers to the manner in which the links and nodes of a network are arranged to relate to each other',
  TopologyView = 'Topology view',
  ListView = 'List view',
  LegendGroupsItems = 'Sites',
  DisplayServicesDefaultLabel = `Filter by service`,
  DisplayResourcesDefaultLabel = `Find a resource`,
  DisplayProcessesDefaultLabel = `Find processes`,
  DisplaySitesDefaultLabel = `Find sites`,
  DisplayComponentsDefaultLabel = `Find components`,
  ShowComponents = 'Group by components',
  Process = 'Process',
  Processes = 'Processes',
  ServerSite = 'Server site',
  ProcessExposed = 'Process exposed',
  Link = 'link',
  ActiveLink = 'Active link (show metrics on)',
  Site = 'site',
  CheckboxShowSite = 'Site',
  CheckBoxShowRouterLinks = 'Router links',
  CheckboxShowDataLinks = 'Data links',
  GroupNodesByComboAndGroup = 'Group similar processes within sites',
  CheckboxShowProtocol = 'Protocol',
  CheckboxShowTotalBytes = 'Bytes',
  CheckboxShowCurrentByteRate = 'Byterate',
  CheckboxShowLatency = 'Latency',
  CheckboxShowLabelReverse = 'Inbound metrics',
  CheckboxShowMetricValue = 'Metric value',
  CheckboxShowMetricDistribution = 'Metric distribution',
  CheckboxShowOnlyNeghbours = 'Show only neighbours',
  CheckboxMoveToNodeSelected = 'Center the selected node',
  ServiceFilterPlaceholderText = 'Search',
  ProcessFilterPlaceholderText = 'Search',
  DisplayPlaceholderText = 'Display',
  ShowDeployments = 'Deployment groups',
  SelectAll = 'Select all',
  DeselectAll = 'Clear filters',
  LoadButton = 'Load',
  SaveButton = 'Save',
  DescriptionButton = 'Load a configuration that includes previously saved settings for filtered services',
  ToastSave = 'Topology saved successfully',
  ToastLoad = 'Topology loaded successfully',
  SiteLinkText = 'Cost',
  TopologyModalTitle = 'Details',
  TopologyModalAction1 = 'View details',
  TopologyModalAction2 = 'View flows',
  TopologyModalAction3 = 'View metrics',
  Source = 'Source',
  Destination = 'Destination',
  TransportProtocol = 'Transport Protocol',
  ApplicationProtocol = 'Application Protocols',
  TitleGroupDisplayOptionsLinkType = 'Link type',
  TitleGroupDisplayOptionsMenuMetrics = 'Metrics',
  TitleGroupDisplayOptionsMenuMetricVisualization = 'Metric Visualization',
  TitleGroupDisplayOptionsMenuOther = 'Other',
  Summary = 'Summary'
}

export enum TopologyURLQueyParams {
  Type = 'type',
  ServiceId = 'serviceId',
  IdSelected = 'id'
}
