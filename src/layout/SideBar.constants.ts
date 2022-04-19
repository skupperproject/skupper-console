import { DeploymentsRoutesPaths } from '@pages/Deployments/Deployments.enum';
import { MonitoringRoutesPaths } from '@pages/Monitoring/Monitoring.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SiteRoutesPaths } from '@pages/Sites/sites.enum';

import { SideBarLabels } from './SideBar.enum';
import { SideBarRouteProps } from './SideBar.interfaces';

export const RoutesProps: SideBarRouteProps[] = [
    {
        path: SiteRoutesPaths.Sites,
        name: SideBarLabels.SideBarSite,
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
