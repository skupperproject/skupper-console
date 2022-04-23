import React, { lazy } from 'react';

import { ErrorConnectionRoutesPaths } from './Connection/Connection.enum';
import { NotFoundRoutesPaths } from './NotFound/sNotFound.enum';
import { ErrorServerRoutesPaths } from './Server/Server.enum';

const ErrorConnection = lazy(() => import(/* webpackChunkName: "connection-err" */ './Connection'));
const ErrorServer = lazy(() => import(/* webpackChunkName: "server err" */ './Server'));
const NotFound = lazy(() => import(/* webpackChunkName: "not-found" */ './NotFound'));

export const errorsRoutes = [
    {
        path: ErrorConnectionRoutesPaths.ErrConnection,
        element: <ErrorConnection />,
    },
    {
        path: ErrorServerRoutesPaths.ErrServer,
        element: <ErrorServer />,
    },
    {
        path: NotFoundRoutesPaths.NotFound,
        element: <NotFound />,
    },
];
