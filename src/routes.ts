import { RouteObject } from 'react-router-dom';

import { deploymentsRoutes } from '@pages/Deployments/routes';
import { monitoringRoutes } from '@pages/Monitoring/routes';
import { overviewRoutes } from '@pages/Network/routes';
import { servicesRoutes } from '@pages/Services/routes';
import { errorsRoutes } from '@pages/shared/Errors/routes';
import { notFoundRoutes } from '@pages/shared/NotFound/routes';
import { siteRoutes } from '@pages/Sites/routes';

export const routes: RouteObject[] = [
    ...overviewRoutes,
    ...siteRoutes,
    ...deploymentsRoutes,
    ...monitoringRoutes,
    ...servicesRoutes,
    ...errorsRoutes,
    ...notFoundRoutes,
];
