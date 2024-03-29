import { lazy } from 'react';

import { TopologyRoutesPaths } from './Topology.enum';

const Topology = lazy(() => import(/* webpackChunkName: "topology" */ './views/Topology'));

export const topologyRoutes = [
  {
    path: TopologyRoutesPaths.Topology,
    element: <Topology />
  }
];
