import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { TopologyRoutesPaths } from '@pages/Topology/Topology.enum';
import { VANServicesRoutesPaths } from '@pages/VANServices/VANServices.enum';

import { NavBarLabels } from './NavBar.enum';

export interface NavBarRouteProps {
    path:
        | SitesRoutesPaths.Sites
        | ServicesRoutesPaths.Services
        | VANServicesRoutesPaths.VANServices
        | TopologyRoutesPaths.Topology;
    name: NavBarLabels;
}
