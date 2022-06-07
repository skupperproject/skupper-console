import React, { lazy } from 'react';

import { OverviewRoutesPaths } from './Overview.enum';

const Overview = lazy(() => import(/* webpackChunkName: "overview" */ '.'));
const OverviewStats = lazy(
    () => import(/* webpackChunkName: "overview-stats" */ './views/Overview'),
);

export const overviewRoutes = [
    {
        path: OverviewRoutesPaths.Overview,
        element: <Overview />,
        children: [
            { index: true, element: <OverviewStats /> },
            {
                path: OverviewRoutesPaths.Stats,
                element: <OverviewStats />,
            },
        ],
    },
];
