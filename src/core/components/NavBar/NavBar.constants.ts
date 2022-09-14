//import { OverviewRoutesPaths } from '@pages/Overview/Overview.enum';
//import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { TopologyRoutesPaths } from '@pages/Topology/Topology.enum';
import { VANServicesRoutesPaths } from '@pages/Addresses/VANServices.enum';

import { NavBarLabels } from './NavBar.enum';
import { NavBarRouteProps } from './NavBar.interfaces';

export const RoutesProps: NavBarRouteProps[] = [
    // {
    //     path: OverviewRoutesPaths.Overview,
    //     name: NavBarLabels.SideBarOverview,
    // },
    {
        path: SitesRoutesPaths.Sites,
        name: NavBarLabels.SideBarSite,
    },
    // {
    //     path: ServicesRoutesPaths.Services,
    //     name: NavBarLabels.SideBarServices,
    // },
    {
        path: VANServicesRoutesPaths.VANServices,
        name: NavBarLabels.SideBarVanServices,
    },
    {
        path: TopologyRoutesPaths.Topology,
        name: NavBarLabels.SideBarTopology,
    },
];
