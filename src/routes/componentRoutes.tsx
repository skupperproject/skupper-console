import { lazy } from 'react';

import { ComponentRoutesPaths } from '../pages/Components/Components.enum';

const Components = lazy(() => import(/* webpackChunkName: "components" */ '../pages/Components/views/Components'));
const Component = lazy(() => import(/* webpackChunkName: "component" */ '../pages/Components/views/Component'));

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
