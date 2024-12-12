import { Navigate, RouteObject } from 'react-router-dom';

import { componentsRoutes } from './componentRoutes';
import { errorsRoutes } from './errorRoutes';
import { processesRoutes } from './processRoutes';
import { servicesRoutes } from './serviceRoutes';
import { siteRoutes } from './siteRoutes';
import { topologyRoutes } from './topologyRoutes';
import { NavigationPaths } from '../config/navigation';

export const routes: RouteObject[] = [
  { index: true, element: <Navigate to={NavigationPaths[0].path} replace={true} /> },
  ...siteRoutes,
  ...servicesRoutes,
  ...componentsRoutes,
  ...processesRoutes,
  ...errorsRoutes,
  ...topologyRoutes
];
