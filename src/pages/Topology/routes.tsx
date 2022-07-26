import React, { lazy } from 'react';

import { TopologyRoutesPaths } from './Topology.enum';

const Topology = lazy(() => import(/* webpackChunkName: "topology" */ '.'));
const TopologyOverview = lazy(
    () => import(/* webpackChunkName: "topology-overview" */ './View/Topology'),
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
