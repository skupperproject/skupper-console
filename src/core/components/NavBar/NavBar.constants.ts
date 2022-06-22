import { DeploymentsRoutesPaths } from '@pages/Deployments/Deployments.enum';
import { MonitoringRoutesPaths } from '@pages/Monitoring/Monitoring.enum';
import { OverviewRoutesPaths } from '@pages/Overview/Overview.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SitesRoutesPaths } from '@pages/Sites/sites.enum';
import { TopologyRoutesPaths } from '@pages/Topology/components/Topology.enum';

import { NavBarLabels } from './NavBar.enum';
import { NavBarRouteProps } from './NavBar.interfaces';

export const RoutesProps: NavBarRouteProps[] = [
    {
        path: OverviewRoutesPaths.Overview,
        name: NavBarLabels.SideBarOverview,
    },
    {
        path: SitesRoutesPaths.Sites,
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
