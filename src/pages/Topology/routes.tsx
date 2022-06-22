import React, { lazy } from 'react';

import { TopologyRoutesPaths } from './components/Topology.enum';

const Topology = lazy(() => import(/* webpackChunkName: "topology-overview" */ '.'));
const TopologyOverview = lazy(
    () => import(/* webpackChunkName: "topology-overview" */ './View/Overview'),
);

export const topologyRoutes = [
    {
        path: TopologyRoutesPaths.Topology,
        element: <Topology />,
        children: [
            { index: true, element: <TopologyOverview /> },
            {
                path: TopologyRoutesPaths.Overview,
                element: <TopologyOverview />,
            },
        ],
    },
];
