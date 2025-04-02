import { lazy } from 'react';

import { NotFoundRoutesPaths } from '../core/components/Errors/NotFound/NotFound.enum';

const NotFound = lazy(() => import(/* webpackChunkName: "not-found-error" */ '../core/components/Errors/NotFound'));

export const errorsRoutes = [
  {
    path: NotFoundRoutesPaths.NotFound,
    element: <NotFound />
  }
];
