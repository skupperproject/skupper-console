import React, { lazy } from 'react';

import { OverviewRoutesPaths as NetworkRoutesPaths } from './Network.enum';

const Network = lazy(() => import(/* webpackChunkName: "network" */ '@pages/Network'));
const Overview = lazy(() => import(/* webpackChunkName: "network-overview" */ './views/Overview'));

export const overviewRoutes = [
    {
        path: NetworkRoutesPaths.Network,
        element: <Network />,
        children: [
            {
                path: NetworkRoutesPaths.Overview,
                element: <Overview />,
            },
        ],
    },
];
