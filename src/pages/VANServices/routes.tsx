import React, { lazy } from 'react';

import { VANServicesRoutesPaths } from './VANServices.enum';

const VANServices = lazy(() => import(/* webpackChunkName: "van-services" */ '.'));
const VANServicesList = lazy(
    () => import(/* webpackChunkName: "van-services-list" */ './views/VANServices'),
);
const FlowPairs = lazy(
    () => import(/* webpackChunkName: "monitoring-flow-pairs" */ './views/FlowPairs'),
);

export const monitoringRoutes = [
    {
        path: VANServicesRoutesPaths.VANServices,
        element: <VANServices />,
        children: [
            { index: true, element: <VANServicesList /> },
            {
                path: VANServicesRoutesPaths.OverviewTable,
                element: <VANServicesList />,
            },
            {
                path: `${VANServicesRoutesPaths.FlowsPairs}/:id`,
                element: <FlowPairs />,
            },
        ],
    },
];
