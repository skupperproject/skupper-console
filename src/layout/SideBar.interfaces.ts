import { DeploymentsRoutesPaths } from '@pages/Deployments/Deployments.enum';
import { MonitoringRoutesPaths } from '@pages/Monitoring/Monitoring.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SiteRoutesPaths } from '@pages/Sites/sites.enum';

import { SideBarLabels } from './SideBar.enum';

export interface SideBarRouteProps {
    path:
        | SiteRoutesPaths.Network
        | SiteRoutesPaths.Sites
        | ServicesRoutesPaths.Services
        | DeploymentsRoutesPaths.Deployments
        | MonitoringRoutesPaths.Monitoring;
    name: SideBarLabels;
}
