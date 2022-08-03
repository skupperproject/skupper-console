import React, { lazy } from 'react';

import { MonitoringRoutesPaths } from './VANServices.enum';

const VANServices = lazy(() => import(/* webpackChunkName: "van-services" */ '.'));
const VANServicesList = lazy(
    () => import(/* webpackChunkName: "van-services-list" */ './views/VANServices'),
);
const Connections = lazy(
    () => import(/* webpackChunkName: "monitoring-connections" */ './views/Connections'),
);
const Connection = lazy(
    () => import(/* webpackChunkName: "monitoring-connection" */ './views/Connection'),
);

export const monitoringRoutes = [
    {
        path: MonitoringRoutesPaths.Monitoring,
        element: <VANServices />,
        children: [
            { index: true, element: <VANServicesList /> },
            {
                path: MonitoringRoutesPaths.OverviewTable,
                element: <VANServicesList />,
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
