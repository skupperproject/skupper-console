import { lazy } from 'react';

import { RouteObject } from 'react-router-dom';

import { processesRoutes } from '@pages/Processes/routes';
import { processGroupsRoutes } from '@pages/ProcessGroups/routes';
import { servicesRoutes } from '@pages/Services/routes';
import { errorsRoutes } from '@pages/shared/Errors/routes';
import { siteRoutes } from '@pages/Sites/routes';
import { topologyRoutes } from '@pages/Topology/routes';

const DefaultRoute = lazy(() => import(/* webpackChunkName: "default-route" */ '@core/components/DefaultRoute'));

export const routes: RouteObject[] = [
  { index: true, element: <DefaultRoute /> },
  ...siteRoutes,
  ...servicesRoutes,
  ...processGroupsRoutes,
  ...processesRoutes,
  ...errorsRoutes,
  ...topologyRoutes
];
