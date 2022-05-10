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
    TotalBytes = 'Traffic',
}

export enum OverviewLinksColumns {
    RouterStart = 'From',
    RouterEnd = 'To',
    Cost = 'Cost',
    Mode = 'Mode',
    Direction = 'Direction',
}
