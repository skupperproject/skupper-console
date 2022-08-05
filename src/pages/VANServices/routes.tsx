import React, { lazy } from 'react';

import { VANServicesRoutesPaths } from './VANServices.enum';

const VANServices = lazy(() => import(/* webpackChunkName: "van-services" */ '.'));
const VANServicesList = lazy(
    () => import(/* webpackChunkName: "van-services-list" */ './views/VANServices'),
);
const FlowsPairs = lazy(
    () => import(/* webpackChunkName: "monitoring-flows-pairs" */ './views/FlowsPairs'),
);
const FlowPair = lazy(
    () => import(/* webpackChunkName: "monitoring-flow-pair" */ './views/FlowPair'),
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
                element: <FlowsPairs />,
            },
            {
                path: `${VANServicesRoutesPaths.FlowsPairs}/:id/:idFlow`,
                element: <FlowPair />,
            },
        ],
    },
];
