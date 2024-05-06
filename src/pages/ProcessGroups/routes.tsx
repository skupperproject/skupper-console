import { lazy } from 'react';

import { ComponentRoutesPaths } from './ProcessGroups.enum';

const ProcessGroups = lazy(() => import(/* webpackChunkName: "components" */ './views/ProcessGroups'));
const ProcessGroup = lazy(() => import(/* webpackChunkName: "component" */ './views/ProcessGroup'));

export const processGroupsRoutes = [
  {
    path: ComponentRoutesPaths.ProcessGroups,
    element: <ProcessGroups />
  },
  {
    path: `${ComponentRoutesPaths.ProcessGroups}/:id`,
    element: <ProcessGroup />
  }
];
