import React, { lazy } from 'react';

import { AddressesRoutesPaths } from './Addresses.enum';

const Addresses = lazy(() => import(/* webpackChunkName: "addresses" */ './views/Addresses'));
const FlowPairs = lazy(
    () => import(/* webpackChunkName: "addresses-flow-pairs" */ './views/FlowPairs'),
);

export const monitoringRoutes = [
    {
        path: AddressesRoutesPaths.Addresses,
        element: <Addresses />,
    },
    {
        path: `${AddressesRoutesPaths.FlowsPairs}/:id`,
        element: <FlowPairs />,
    },
];
