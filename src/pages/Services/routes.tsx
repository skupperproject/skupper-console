import React, { lazy } from 'react';

import { ServicesRoutesPaths } from './Services.enum';

const Services = lazy(() => import(/* webpackChunkName: "services" */ '.'));
const ServicesOverview = lazy(
    () => import(/* webpackChunkName: "services-overview" */ './views/Services'),
);

export const servicesRoutes = [
    {
        path: ServicesRoutesPaths.Services,
        element: <Services />,
        children: [
            { index: true, element: <ServicesOverview /> },
            {
                path: ServicesRoutesPaths.Overview,
                element: <ServicesOverview />,
            },
        ],
    },
];
