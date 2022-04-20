import React, { lazy } from 'react';

import { ServicesRoutesPaths } from './Services.enum';

const Services = lazy(() => import(/* webpackChunkName: "services" */ '@pages/Services'));
const ServicesOverview = lazy(
    () => import(/* webpackChunkName: "services-overview" */ './views/Overview'),
);

export const servicesRoutes = [
    {
        path: ServicesRoutesPaths.Services,
        element: <Services />,
        children: [
            {
                path: ServicesRoutesPaths.Overview,
                element: <ServicesOverview />,
            },
        ],
    },
];
