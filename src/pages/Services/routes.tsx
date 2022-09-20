import React, { lazy } from 'react';

import { ServicesRoutesPaths } from './Services.enum';

const ServicesContainer = lazy(() => import(/* webpackChunkName: "services-container" */ '.'));
const Services = lazy(() => import(/* webpackChunkName: "services" */ './views/Services'));

export const servicesRoutes = [
    {
        path: ServicesRoutesPaths.Services,
        element: <ServicesContainer />,
        children: [
            { index: true, element: <Services /> },
            {
                path: ServicesRoutesPaths.Services,
                element: <Services />,
            },
        ],
    },
];
