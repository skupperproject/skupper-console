export enum OverviewNetworkColumns {
    Name = 'Name',
    NumRouters = 'Routers',
    NumServices = 'Services',
    NumConnections = 'Flows',
    NumLinks = 'Links',
    TotalBytes = 'Traffic',
}

export enum OverviewLabels {
    Routers = 'Routers',
    Links = 'Links',
}

export enum OverviewRoutersColumns {
    Name = 'Name',
    NumRouters = 'Routers',
    NumServices = 'Services',
    NumFLows = 'Flows',
}

export enum OverviewLinksColumns {
    RouterStart = 'From',
    RouterEnd = 'To',
    Cost = 'Cost',
    Mode = 'Mode',
}
