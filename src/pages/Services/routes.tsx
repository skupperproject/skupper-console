import React, { lazy } from 'react';

import { ServicesRoutesPaths } from './Services.enum';

const ServicesContainer = lazy(() => import(/* webpackChunkName: "services-container" */ '.'));
const Services = lazy(() => import(/* webpackChunkName: "services" */ './views/Services'));
const Service = lazy(() => import(/* webpackChunkName: "service" */ './views/Service'));

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
            {
                path: `${ServicesRoutesPaths.Services}/:id`,
                element: <Service />,
            },
        ],
    },
];
