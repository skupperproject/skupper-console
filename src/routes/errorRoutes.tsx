import { lazy } from 'react';

import { NotFoundRoutesPaths } from '../pages/shared/Errors/NotFound/NotFound.enum';

const NotFound = lazy(() => import(/* webpackChunkName: "not-found-error" */ '../pages/shared/Errors/NotFound'));

export const errorsRoutes = [
  {
    path: NotFoundRoutesPaths.NotFound,
    element: <NotFound />
  }
];
