import React, { lazy } from 'react';

import { MonitoringRoutesPaths } from './Monitoring.enum';

const Monitoring = lazy(() => import(/* webpackChunkName: "monitoring" */ './'));
const VANs = lazy(() => import(/* webpackChunkName: "monitoring-vans" */ './VANs'));
const Devices = lazy(() => import(/* webpackChunkName: "monitoring-devices" */ './Devices'));

export const monitoringRoutes = [
  {
    path: MonitoringRoutesPaths.Monitoring,
    element: <Monitoring />,
    children: [
      { index: true, element: <VANs /> },
      {
        path: MonitoringRoutesPaths.VANs,
        element: <VANs />,
      },
      {
        path: `${MonitoringRoutesPaths.Devices}/:id`,
        element: <Devices />,
      },
    ],
  },
];
