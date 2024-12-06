export enum SitesRoutesPaths {
  Sites = '/sites'
}

export enum QueriesSites {
  GetSites = 'get-sites-query',
  GetSite = 'get-site-query',
  GetSitesPairs = 'get-sites-pairs-query',
  GetRouters = 'get-routers-query',
  GetLinks = 'get-links-query',
  GetProcessesBySiteId = 'get-processes-by-site-id-query'
}

export enum SiteLabels {
  Section = 'Sites',
  Overview = 'Overview',
  Links = 'Router links',
  InLinks = 'Incoming',
  OutLinks = 'Outgoing',
  Description = 'A site is a location where components of your application are running and they are linked together to form a network',
  Details = 'Details',
  SourceSite = 'From',
  SourceRouter = 'From router',
  TargetSite = 'To',
  TargetRouter = 'To router',
  Hosts = 'Providers',
  Processes = 'Processes',
  Name = 'Name',
  Namespace = 'Namespace',
  SiteVersion = 'Version',
  Cost = 'Cost',
  Platform = 'Platform',
  Created = 'Created',
  Pairs = 'Data links',
  Clients = 'Clients',
  Servers = 'Servers',
  LinkStatus = 'Status',
  Routers = 'Routers',
  HA = 'High availability',
  YES = 'true',
  NO = 'false'
}
