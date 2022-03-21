import React, { lazy } from 'react';

import { NetworkRoutesPaths } from './Network.enum';

const Network = lazy(() => import(/* webpackChunkName: "network" */ '@pages/Network'));

export const networkRoutes = [
  {
    path: NetworkRoutesPaths.Network,
    element: <Network />,
  },
];
