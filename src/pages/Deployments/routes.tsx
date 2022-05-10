import React, { lazy } from 'react';

import { DeploymentsRoutesPaths } from './Deployments.enum';

const Deployments = lazy(() => import(/* webpackChunkName: "deployments" */ '@pages/Deployments'));
const DeploymentsOverview = lazy(
    () => import(/* webpackChunkName: "deployments-overview" */ './views/Overview'),
);
const DeploymentsDetails = lazy(
    () => import(/* webpackChunkName: "deployments-details" */ './views/Details'),
);

export const deploymentsRoutes = [
    {
        path: DeploymentsRoutesPaths.Deployments,
        element: <Deployments />,
        children: [
            { index: true, element: <DeploymentsOverview /> },
            {
                path: DeploymentsRoutesPaths.Overview,
                element: <DeploymentsOverview />,
            },
            {
                path: `${DeploymentsRoutesPaths.Details}/:id`,
                element: <DeploymentsDetails />,
            },
        ],
    },
];
