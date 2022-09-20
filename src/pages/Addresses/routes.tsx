import React, { lazy } from 'react';

import { AddressesRoutesPaths } from './Addresses.enum';

const AddressesContainer = lazy(() => import(/* webpackChunkName: "addresses-container" */ '.'));
const Addresses = lazy(() => import(/* webpackChunkName: "addresses" */ './views/Addresses'));
const FlowPairs = lazy(
    () => import(/* webpackChunkName: "monitoring-flow-pairs" */ './views/FlowPairs'),
);

export const monitoringRoutes = [
    {
        path: AddressesRoutesPaths.Addresses,
        element: <AddressesContainer />,
        children: [
            { index: true, element: <Addresses /> },
            {
                path: AddressesRoutesPaths.Addresses,
                element: <Addresses />,
            },
            {
                path: `${AddressesRoutesPaths.FlowsPairs}/:id`,
                element: <FlowPairs />,
            },
        ],
    },
];
