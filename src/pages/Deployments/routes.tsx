import React, { lazy } from 'react';

import { DeploymentsRoutesPaths } from './Deployments.enum';

const Deployments = lazy(() => import(/* webpackChunkName: "deployments" */ '@pages/Deployments'));

export const deploymentsRoutes = [
  {
    path: DeploymentsRoutesPaths.Deployments,
    element: <Deployments />,
  },
];
