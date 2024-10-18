import { Navigate, RouteObject } from 'react-router-dom';

import { DEFAULT_ROUTE } from './config/routes';
import { processesRoutes } from './pages/Processes/routes';
import { processGroupsRoutes } from './pages/ProcessGroups/routes';
import { servicesRoutes } from './pages/Services/routes';
import { errorsRoutes } from './pages/shared/Errors/routes';
import { siteRoutes } from './pages/Sites/routes';
import { topologyRoutes } from './pages/Topology/routes';

export const routes: RouteObject[] = [
  { index: true, element: <Navigate to={DEFAULT_ROUTE} replace={true} /> },
  ...siteRoutes,
  ...servicesRoutes,
  ...processGroupsRoutes,
  ...processesRoutes,
  ...errorsRoutes,
  ...topologyRoutes
];
