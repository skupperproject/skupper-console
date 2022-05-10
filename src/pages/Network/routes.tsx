import React, { lazy } from 'react';

import { NetworkRoutesPaths } from './Network.enum';

const Network = lazy(() => import(/* webpackChunkName: "network" */ '.'));
const NetworkOverview = lazy(
    () => import(/* webpackChunkName: "network-overview" */ './views/Overview'),
);

export const overviewRoutes = [
    {
        path: NetworkRoutesPaths.Network,
        element: <Network />,
        children: [
            { index: true, element: <NetworkOverview /> },
            {
                path: NetworkRoutesPaths.Overview,
                element: <NetworkOverview />,
            },
        ],
    },
];
