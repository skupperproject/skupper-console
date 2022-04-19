import React, { lazy } from 'react';

import { DeploymentsRoutesPaths } from './Deployments.enum';
import DeploymentsOverview from './views/Overview';

const Deployments = lazy(() => import(/* webpackChunkName: "deployments" */ '@pages/Deployments'));

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
