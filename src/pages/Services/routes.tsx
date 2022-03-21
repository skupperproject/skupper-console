import React, { lazy } from 'react';

import { ServicesRoutesPaths } from './Services.enum';

const Services = lazy(() => import(/* webpackChunkName: "services" */ '@pages/Services'));

export const servicesRoutes = [
  {
    path: ServicesRoutesPaths.Services,
    element: <Services />,
  },
];
