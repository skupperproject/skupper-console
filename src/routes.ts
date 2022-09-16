import { RouteObject } from 'react-router-dom';

import { monitoringRoutes } from '@pages/Addresses/routes';
import { servicesRoutes } from '@pages/Services/routes';
import { errorsRoutes } from '@pages/shared/Errors/routes';
import { siteRoutes } from '@pages/Sites/routes';
import { topologyRoutes } from '@pages/Topology/routes';

export const routes: RouteObject[] = [
    ...siteRoutes,
    ...monitoringRoutes,
    ...servicesRoutes,
    ...errorsRoutes,
    ...topologyRoutes,
];
