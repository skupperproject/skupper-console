import React, { lazy } from 'react';

import { TopologyRoutesPaths } from './Topology.enum';

const TopologyContainer = lazy(() => import(/* webpackChunkName: "topology-container" */ '.'));
const Topology = lazy(() => import(/* webpackChunkName: "topology" */ './View/Topology'));

export const topologyRoutes = [
    {
        path: TopologyRoutesPaths.Topology,
        element: <TopologyContainer />,
        children: [
            { index: true, element: <Topology /> },
            {
                path: TopologyRoutesPaths.Topology,
                element: <Topology />,
            },
        ],
    },
];
