import { lazy } from 'react';

import { AddressesRoutesPaths } from './Addresses.enum';

const Services = lazy(() => import(/* webpackChunkName: "services" */ './views/Addresses'));
const FlowPairs = lazy(() => import(/* webpackChunkName: "services-flow-pairs" */ './views/FlowPairs'));

export const addressesRoutes = [
  {
    path: AddressesRoutesPaths.Services,
    element: <Services />
  },
  {
    path: `${AddressesRoutesPaths.Services}/:service`,
    element: <FlowPairs />
  }
];
