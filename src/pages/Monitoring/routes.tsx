import React, { lazy } from 'react';

import { MonitoringRoutesPaths } from './Monitoring.enum';

const Monitoring = lazy(() => import(/* webpackChunkName: "monitoring" */ './'));

export const monitoringRoutes = [
  {
    path: MonitoringRoutesPaths.Monitoring,
    element: <Monitoring />,
  },
];
