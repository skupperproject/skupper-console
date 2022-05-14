import { DeploymentsRoutesPaths } from '@pages/Deployments/Deployments.enum';
import { MonitoringRoutesPaths } from '@pages/Monitoring/Monitoring.enum';
import { NetworkRoutesPaths } from '@pages/Network/Network.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SitesRoutesPaths } from '@pages/Sites/sites.enum';
import { TopologyRoutesPaths } from '@pages/Topology/components/topology.enum';

import { NavBarLabels } from './NavBar.enum';

export interface NavBarRouteProps {
    path:
        | NetworkRoutesPaths.Network
        | SitesRoutesPaths.Sites
        | ServicesRoutesPaths.Services
        | DeploymentsRoutesPaths.Deployments
        | MonitoringRoutesPaths.Monitoring
        | TopologyRoutesPaths.Topology;
    name: NavBarLabels;
}
