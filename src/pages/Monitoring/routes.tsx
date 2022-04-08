import React, { lazy } from 'react';

import { MonitoringRoutesPaths } from './Monitoring.enum';

const Monitoring = lazy(() => import(/* webpackChunkName: "monitoring" */ './'));
const Overview = lazy(() => import(/* webpackChunkName: "monitoring-vans" */ './views/Overview'));
const Devices = lazy(() => import(/* webpackChunkName: "monitoring-devices" */ './views/Devices'));
const DevicesTable = lazy(
  () => import(/* webpackChunkName: "monitoring-devices-table" */ './views/Devices/table'),
);
const DevicesTopology = lazy(
  () => import(/* webpackChunkName: "monitoring-devices-topology" */ './views/Devices/topology'),
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
        path: `${MonitoringRoutesPaths.Devices}/:id`,
        element: <Devices />,
        children: [
          { index: true, element: <DevicesTable /> },
          {
            path: `${MonitoringRoutesPaths.Devices}/:id/${MonitoringRoutesPaths.DevicesTopology}`,
            element: <DevicesTopology />,
          },
          {
            path: `${MonitoringRoutesPaths.Devices}/:id/${MonitoringRoutesPaths.DevicesTable}`,
            element: <DevicesTable />,
          },
        ],
      },
    ],
  },
];
