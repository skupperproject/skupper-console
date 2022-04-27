import React, { lazy } from 'react';

import { TopologyRoutesPaths } from './topology.enum';

const Topology = lazy(() => import(/* webpackChunkName: "topology" */ './'));

export const topologyRoutes = [
    {
        path: TopologyRoutesPaths.Topology,
        element: <Topology />,
    },
];
