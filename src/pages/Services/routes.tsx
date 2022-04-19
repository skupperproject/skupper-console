import React, { lazy } from 'react';

import { ServicesRoutesPaths } from './Services.enum';
import ServicesOverview from './views/Overview';

const Services = lazy(() => import(/* webpackChunkName: "services" */ '@pages/Services'));

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
