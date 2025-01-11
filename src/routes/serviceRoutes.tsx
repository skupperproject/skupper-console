import { lazy } from 'react';

import { ServicesRoutesPaths } from '../pages/Services/Services.enum';

const Services = lazy(() => import(/* webpackChunkName: "services" */ '../pages/Services/views/Services'));
const Service = lazy(() => import(/* webpackChunkName: "service" */ '../pages/Services/views/Service'));

export const servicesRoutes = [
  {
    path: ServicesRoutesPaths.Services,
    element: <Services />
  },
  {
    path: `${ServicesRoutesPaths.Services}/:id`,
    element: <Service />
  }
];
