import { lazy } from 'react';

import { ComponentRoutesPaths } from './Components.enum';

const Components = lazy(() => import(/* webpackChunkName: "components" */ './views/Components'));
const Component = lazy(() => import(/* webpackChunkName: "component" */ './views/Component'));

export const componentsRoutes = [
  {
    path: ComponentRoutesPaths.Components,
    element: <Components />
  },
  {
    path: `${ComponentRoutesPaths.Components}/:id`,
    element: <Component />
  }
];
