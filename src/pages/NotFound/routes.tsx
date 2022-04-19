import React, { lazy } from 'react';

import { NotFoundRoutesPaths } from './notFound.enum';

const NotFound = lazy(() => import(/* webpackChunkName: "not-found" */ '@pages/NotFound'));

export const notFoundRoutes = [
    {
        path: NotFoundRoutesPaths.NotFound,
        element: <NotFound />,
    },
];
