import React, { lazy } from 'react';

import { MonitoringRoutesPaths } from './Monitoring.enum';

const Monitoring = lazy(() => import(/* webpackChunkName: "monitoring" */ '.'));
const MonitoringOverview = lazy(
    () => import(/* webpackChunkName: "monitoring-vans" */ './views/Overview'),
);
const MonitoringConnections = lazy(
    () => import(/* webpackChunkName: "monitoring-connections" */ './views/Connections'),
);
const ConnectionsTable = lazy(
    () => import(/* webpackChunkName: "monitoring-connections-table" */ './components/table'),
);
const ConnectionsTopology = lazy(
    () => import(/* webpackChunkName: "monitoring-connections-topology" */ './components/topology'),
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
                        path: `${MonitoringRoutesPaths.Connections}/:id/${MonitoringRoutesPaths.ConnectionsTopology}`,
                        element: <ConnectionsTopology />,
                    },
                    {
                        path: `${MonitoringRoutesPaths.Connections}/:id/${MonitoringRoutesPaths.ConnectionsTable}`,
                        element: <ConnectionsTable />,
                    },
                ],
            },
        ],
    },
];
