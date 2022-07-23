import React, { lazy } from 'react';

import { MonitoringRoutesPaths } from './Monitoring.enum';

const Monitoring = lazy(() => import(/* webpackChunkName: "monitoring" */ '.'));

const MonitoringOverview = lazy(
    () => import(/* webpackChunkName: "monitoring-vans" */ './views/Monitoring'),
);
const MonitoringConnections = lazy(
    () => import(/* webpackChunkName: "monitoring-connections" */ './views/Connections'),
);
const ConnectionsTable = lazy(
    () => import(/* webpackChunkName: "monitoring-details" */ './views/Details'),
);
const FlowDetails = lazy(
    () => import(/* webpackChunkName: "monitoring-flow-details" */ './views/FlowDetails'),
);

export const monitoringRoutes = [
    {
        path: MonitoringRoutesPaths.Monitoring,
        element: <Monitoring />,
        children: [
            { index: true, element: <MonitoringOverview /> },
            {
                path: MonitoringRoutesPaths.OverviewTable,
                element: <MonitoringOverview />,
            },
            {
                path: `${MonitoringRoutesPaths.Connections}/:id`,
                element: <MonitoringConnections />,
                children: [
                    { index: true, element: <ConnectionsTable /> },
                    {
                        path: `${MonitoringRoutesPaths.Connections}/:id/:idFlow`,
                        element: <FlowDetails />,
                    },
                ],
            },
        ],
    },
];
