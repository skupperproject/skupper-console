import { DeploymentsRoutesPaths } from '@pages/Deployments/Deployments.enum';
import { MonitoringRoutesPaths } from '@pages/Monitoring/Monitoring.enum';
import { NetworkRoutesPaths } from '@pages/Network/Network.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SiteRoutesPaths } from '@pages/Site/site.enum';

import { SideBarLabels } from './SideBar.enum';

export interface SideBarRouteProps {
  path:
    | SiteRoutesPaths.Site
    | NetworkRoutesPaths.Network
    | ServicesRoutesPaths.Services
    | DeploymentsRoutesPaths.Deployments
    | MonitoringRoutesPaths.Monitoring;
  name: SideBarLabels;
}
