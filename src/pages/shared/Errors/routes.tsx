import { lazy } from 'react';

import { ErrorConnectionRoutesPaths } from './Connection/Connection.enum';
import { ErrorHttpRoutesPaths } from './Http/Http.enum';
import { NotFoundRoutesPaths } from './NotFound/NotFound.enum';

const ErrorConnection = lazy(() => import(/* webpackChunkName: "refuse-connection-error" */ './Connection'));
const ErrorServer = lazy(() => import(/* webpackChunkName: "http-error" */ './Http'));
const NotFound = lazy(() => import(/* webpackChunkName: "not-found-error" */ './NotFound'));

export const errorsRoutes = [
  {
    path: ErrorConnectionRoutesPaths.ErrConnection,
    element: <ErrorConnection />
  },
  {
    path: ErrorHttpRoutesPaths.HttpError,
    element: <ErrorServer />
  },
  {
    path: NotFoundRoutesPaths.NotFound,
    element: <NotFound />
  }
];
