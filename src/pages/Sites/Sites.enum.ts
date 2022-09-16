export enum SitesRoutesPaths {
    Sites = '/sites',
    Overview = '/sites/overview',
    Details = '/sites/details',
}

export enum SitesRoutesPathLabel {
    Sites = 'Sites',
}

export enum Labels {
    Sites = 'Sites',
    SitesDescription = 'Set of applications running under the same geographical area',
    SiteInfo = 'Details',
    Links = 'Linked to sites',
    Hosts = 'Hosts',
    Processes = 'Processes',
}

export enum SitesTableColumns {
    Name = 'Name',
    NumHosts = 'Hosts',
    NumProcesses = 'Processes',
    NumSitesLinked = 'Links',
}

export enum HostsTableColumns {
    Name = 'Name',
    Provider = 'Provider',
}

export enum ProcessesTableColumns {
    Name = 'Name',
    SourceHost = 'Source Host',
}

export enum SiteDetails {
    Name = 'Name',
    Namespace = 'Namespace',
}
