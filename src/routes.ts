import { RouteObject } from 'react-router-dom';

import { deploymentsRoutes } from '@pages/Deployments/routes';
import { errorsRoutes } from '@pages/Errors/routes';
import { monitoringRoutes } from '@pages/Monitoring/routes';
import { notFoundRoutes } from '@pages/NotFound/routes';
import { servicesRoutes } from '@pages/Services/routes';
import { siteRoutes } from '@pages/Sites/routes';

export const routes: RouteObject[] = [
  ...siteRoutes,
  ...deploymentsRoutes,
  ...monitoringRoutes,
  ...servicesRoutes,
  ...errorsRoutes,
  ...notFoundRoutes,
];
