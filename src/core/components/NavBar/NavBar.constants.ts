import { VANServicesRoutesPaths } from '@pages/Addresses/VANServices.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SitesPaths } from '@pages/Sites/Sites.constant';
import { TopologyRoutesPaths } from '@pages/Topology/Topology.enum';

import { NavBarLabels } from './NavBar.enum';

export const RoutesProps = [
    SitesPaths,
    {
        path: ServicesRoutesPaths.Services,
        name: NavBarLabels.SideBarServices,
    },
    {
        path: VANServicesRoutesPaths.VANServices,
        name: NavBarLabels.SideBarVanServices,
    },
    {
        path: TopologyRoutesPaths.Topology,
        name: NavBarLabels.SideBarTopology,
    },
];
