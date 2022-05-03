import { DeploymentsRoutesPaths } from '@pages/Deployments/Deployments.enum';
import { MonitoringRoutesPaths } from '@pages/Monitoring/Monitoring.enum';
import { NetworkRoutesPaths } from '@pages/Network/Network.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SiteRoutesPaths } from '@pages/Sites/sites.enum';
import { TopologyRoutesPaths } from '@pages/Topology/topology.enum';

import { NavBarLabels } from './NavBar.enum';
import { NavBarRouteProps } from './NavBar.interfaces';

export const RoutesProps: NavBarRouteProps[] = [
    {
        path: NetworkRoutesPaths.Network,
        name: NavBarLabels.SideBarNetwork,
    },
    {
        path: SiteRoutesPaths.Sites,
        name: NavBarLabels.SideBarSite,
    },
    {
        path: ServicesRoutesPaths.Services,
        name: NavBarLabels.SideBarServices,
    },
    {
        path: DeploymentsRoutesPaths.Deployments,
        name: NavBarLabels.SideBarDeployments,
    },
    {
        path: MonitoringRoutesPaths.Monitoring,
        name: NavBarLabels.SideBarMonitoring,
    },
    {
        path: TopologyRoutesPaths.Topology,
        name: NavBarLabels.SideBarTopology,
    },
];
