import { AddressesRoutesPaths } from '@pages/Addresses/Addresses.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { TopologyRoutesPaths } from '@pages/Topology/Topology.enum';

import { NavBarLabels } from './NavBar.enum';

export interface NavBarRouteProps {
    path:
        | SitesRoutesPaths.Sites
        | ServicesRoutesPaths.Services
        | AddressesRoutesPaths.VANServices
        | TopologyRoutesPaths.Topology;
    name: NavBarLabels;
}
