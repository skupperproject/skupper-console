import { DeploymentsRoutesPaths } from '@pages/Deployments/Deployments.enum';
import { MonitoringRoutesPaths } from '@pages/Monitoring/Monitoring.enum';
import { NetworkRoutesPaths } from '@pages/Network/Network.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SiteRoutesPaths } from '@pages/Site/site.enum';

import { SideBarLabels } from './SideBar.enum';
import { SideBarRouteProps } from './SideBar.interfaces';

export const RoutesProps: SideBarRouteProps[] = [
  {
    path: SiteRoutesPaths.Site,
    name: SideBarLabels.SideBarSite,
  },
  {
    path: NetworkRoutesPaths.Network,
    name: SideBarLabels.SideBarNetwork,
  },
  {
    path: ServicesRoutesPaths.Services,
    name: SideBarLabels.SideBarServices,
  },
  {
    path: DeploymentsRoutesPaths.Deployments,
    name: SideBarLabels.SideBarDeployments,
  },
  {
    path: MonitoringRoutesPaths.Monitoring,
    name: SideBarLabels.SideBarMonitoring,
  },
];
