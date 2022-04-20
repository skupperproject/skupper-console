import React, { lazy } from 'react';

import { DeploymentsRoutesPaths } from './Deployments.enum';

const Deployments = lazy(() => import(/* webpackChunkName: "deployments" */ '@pages/Deployments'));
const DeploymentsOverview = lazy(
    () => import(/* webpackChunkName: "deployments-overview" */ './views/Overview'),
);

export const deploymentsRoutes = [
    {
        path: DeploymentsRoutesPaths.Deployments,
        element: <Deployments />,
        children: [
            {
                path: DeploymentsRoutesPaths.Overview,
                element: <DeploymentsOverview />,
            },
        ],
    },
];
