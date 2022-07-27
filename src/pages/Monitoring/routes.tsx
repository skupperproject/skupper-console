import React, { lazy } from 'react';

import { MonitoringRoutesPaths } from './Monitoring.enum';

const Monitoring = lazy(() => import(/* webpackChunkName: "monitoring" */ '.'));

const VanAddresses = lazy(() => import(/* webpackChunkName: "monitoring" */ './views/Monitoring'));
const Connections = lazy(
    () => import(/* webpackChunkName: "monitoring-connections" */ './views/Connections'),
);
const Connection = lazy(
    () => import(/* webpackChunkName: "monitoring-connection" */ './views/Connection'),
);

export const monitoringRoutes = [
    {
        path: MonitoringRoutesPaths.Monitoring,
        element: <Monitoring />,
        children: [
            { index: true, element: <VanAddresses /> },
            {
                path: MonitoringRoutesPaths.OverviewTable,
                element: <VanAddresses />,
            },
            {
                path: `${MonitoringRoutesPaths.Connections}/:id`,
                element: <Connections />,
            },
            {
                path: `${MonitoringRoutesPaths.Connections}/:id/:idFlow`,
                element: <Connection />,
            },
        ],
    },
];
