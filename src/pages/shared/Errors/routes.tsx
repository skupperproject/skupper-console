import { lazy } from 'react';

import { NotFoundRoutesPaths } from './NotFound/NotFound.enum';

const NotFound = lazy(() => import(/* webpackChunkName: "not-found-error" */ './NotFound'));

export const errorsRoutes = [
  {
    path: NotFoundRoutesPaths.NotFound,
    element: <NotFound />
  }
];
