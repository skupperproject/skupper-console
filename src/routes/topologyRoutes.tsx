import { lazy } from 'react';

import { TopologyRoutesPaths } from '../pages/Topology/Topology.enum';

const Topology = lazy(() => import(/* webpackChunkName: "topology" */ '../pages/Topology/views/Topology'));

export const topologyRoutes = [
  {
    path: TopologyRoutesPaths.Topology,
    element: <Topology />
  }
];
