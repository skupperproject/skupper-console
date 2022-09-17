import React, { lazy } from 'react';

import { AddressesRoutesPaths } from './Addresses.enum';

const VANServices = lazy(() => import(/* webpackChunkName: "van-services" */ '.'));
const VANServicesList = lazy(
    () => import(/* webpackChunkName: "van-services-list" */ './views/Addresses'),
);
const FlowPairs = lazy(
    () => import(/* webpackChunkName: "monitoring-flow-pairs" */ './views/FlowPairs'),
);

export const monitoringRoutes = [
    {
        path: AddressesRoutesPaths.VANServices,
        element: <VANServices />,
        children: [
            { index: true, element: <VANServicesList /> },
            {
                path: AddressesRoutesPaths.OverviewTable,
                element: <VANServicesList />,
            },
            {
                path: `${AddressesRoutesPaths.FlowsPairs}/:id`,
                element: <FlowPairs />,
            },
        ],
    },
];
