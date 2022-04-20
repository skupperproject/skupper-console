import React, { lazy } from 'react';

import { OverviewRoutesPaths as NetworkRoutesPaths } from './Network.enum';
import OverviewPage from './views/Overview';

const Network = lazy(() => import(/* webpackChunkName: "network" */ '@pages/Network'));

export const overviewRoutes = [
    {
        path: NetworkRoutesPaths.Network,
        element: <Network />,
        children: [
            {
                path: NetworkRoutesPaths.Overview,
                element: <OverviewPage />,
            },
        ],
    },
];
