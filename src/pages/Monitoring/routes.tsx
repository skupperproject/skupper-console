import React, { lazy } from 'react';

import { MonitoringRoutesPaths } from './Monitoring.enum';
import MonitoringTopology from './views/Overview/components/topology';

const Monitoring = lazy(() => import(/* webpackChunkName: "monitoring" */ './'));
const Overview = lazy(() => import(/* webpackChunkName: "monitoring-vans" */ './views/Overview'));
const Devices = lazy(() => import(/* webpackChunkName: "monitoring-devices" */ './views/Devices'));

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
        path: `${MonitoringRoutesPaths.OverviewTopology}/:id`,
        element: <MonitoringTopology />,
      },
      {
        path: `${MonitoringRoutesPaths.Devices}/:id`,
        element: <Devices />,
      },
    ],
  },
];
