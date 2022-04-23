import React, { lazy } from 'react';

import { ErrorRoutesPaths } from './errors.enum';

const ErrorConnection = lazy(
    () => import(/* webpackChunkName: "connection-error" */ './ErrorConnection'),
);
const ErrorServer = lazy(() => import(/* webpackChunkName: "server error" */ './ErrorServer'));

export const errorsRoutes = [
    {
        path: ErrorRoutesPaths.ErrConnection,
        element: <ErrorConnection />,
    },
    {
        path: ErrorRoutesPaths.ErrServer,
        element: <ErrorServer />,
    },
];
