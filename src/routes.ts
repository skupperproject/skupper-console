import { RouteObject } from 'react-router-dom';

import { overviewRoutes } from '@pages/Overview/routes';
import { servicesRoutes } from '@pages/Services/routes';
import { errorsRoutes } from '@pages/shared/Errors/routes';
import { siteRoutes } from '@pages/Sites/routes';
import { topologyRoutes } from '@pages/Topology/routes';
import { monitoringRoutes } from '@pages/VANServices/routes';

export const routes: RouteObject[] = [
    ...overviewRoutes,
    ...siteRoutes,
    ...monitoringRoutes,
    ...servicesRoutes,
    ...errorsRoutes,
    ...topologyRoutes,
];
