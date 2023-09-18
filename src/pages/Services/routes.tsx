import { lazy } from 'react';

import { ServicesRoutesPaths } from './Services.enum';

const Services = lazy(() => import(/* webpackChunkName: "services" */ './views/Services'));
const Service = lazy(() => import(/* webpackChunkName: "service" */ './views/Service'));

export const servicesRoutes = [
  {
    path: ServicesRoutesPaths.Services,
    element: <Services />
  },
  {
    path: `${ServicesRoutesPaths.Services}/:service`,
    element: <Service />
  }
];
