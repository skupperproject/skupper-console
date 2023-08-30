import { lazy } from 'react';

import { AddressesRoutesPaths } from './Services.enum';

const Services = lazy(() => import(/* webpackChunkName: "services" */ './views/Services'));
const Service = lazy(() => import(/* webpackChunkName: "service" */ './views/Service'));

export const addressesRoutes = [
  {
    path: AddressesRoutesPaths.Services,
    element: <Services />
  },
  {
    path: `${AddressesRoutesPaths.Services}/:service`,
    element: <Service />
  }
];
