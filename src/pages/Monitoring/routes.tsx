import React, { lazy } from 'react';

import { MonitoringRoutesPaths } from './Monitoring.enum';

const Monitoring = lazy(() => import(/* webpackChunkName: "monitoring" */ './'));
const Overview = lazy(() => import(/* webpackChunkName: "monitoring-vans" */ './views/Overview'));
const Connections = lazy(
  () => import(/* webpackChunkName: "monitoring-connections" */ './views/Connections'),
);
const ConnectionsTable = lazy(
  () => import(/* webpackChunkName: "monitoring-connections-table" */ './views/Connections/table'),
);
const ConnectionsTopology = lazy(
  () =>
    import(
      /* webpackChunkName: "monitoring-connections-topology" */ './views/Connections/topology'
    ),
);

export const monitoringRoutes = [
  {
    path: MonitoringRoutesPaths.Monitoring,
    element: <Monitoring />,
    children: [
      { index: true, element: <Overview /> },
      {
        path: MonitoringRoutesPaths.OverviewTable,
        element: <Overview />,
      },
      {
        path: `${MonitoringRoutesPaths.Connections}/:id`,
        element: <Connections />,
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
