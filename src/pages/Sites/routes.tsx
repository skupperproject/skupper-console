import React, { lazy } from 'react';

import { SiteRoutesPaths } from './sites.enum';

const Site = lazy(() => import(/* webpackChunkName: "sites" */ '.'));
const SiteOverview = lazy(() => import(/* webpackChunkName: "site-overview" */ './views/Overview'));

export const siteRoutes = [
  {
    path: SiteRoutesPaths.Sites,
    element: <Site />,
    children: [
      {
        path: SiteRoutesPaths.Overview,
        element: <SiteOverview />,
      },
    ],
  },
];
