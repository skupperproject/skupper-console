export enum SitesRoutesPaths {
  Sites = '/sites'
}

export enum QueriesSites {
  GetSites = 'get-sites-query',
  GetSite = 'get-site-query',
  GetSitesPairs = 'get-sites-pairs-query',
  GetHostsBySiteId = 'get-hosts-by-site-id-query',
  GetLinksBySiteId = 'get-links-by-site-id-query',
  GetRouters = 'get-routers-query',
  GetLinks = 'get-links-query',
  GetProcessesBySiteId = 'get-processes-by-site-id-query'
}

export enum SiteLabels {
  Section = 'Sites',
  Overview = 'Overview',
  Description = 'A site is a location where components of your application are running and they are linked together to form a network',
  Details = 'Details',
  Links = 'Links created to',
  Hosts = 'Hosts',
  Processes = 'Processes',
  Name = 'Name',
  Namespace = 'Namespace',
  SiteVersion = 'Version',
  Created = 'Created'
}
