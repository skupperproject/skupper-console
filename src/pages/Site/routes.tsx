import React, { lazy } from 'react';

import { SiteRoutesPaths } from './site.enum';

const Site = lazy(() => import(/* webpackChunkName: "sites" */ './'));
const SiteOverview = lazy(() => import(/* webpackChunkName: "site-overview" */ './views/Overview'));
const SiteLinks = lazy(() => import(/* webpackChunkName: "site-links" */ './views/Links'));
const SiteDeployments = lazy(
  () => import(/* webpackChunkName: "site-deployments" */ './views/Deployments'),
);

export const siteRoutes = [
  {
    path: SiteRoutesPaths.Site,
    element: <Site />,
    children: [
      {
        path: SiteRoutesPaths.Overview,
        element: <SiteOverview />,
      },
      {
        path: SiteRoutesPaths.Deployments,
        element: <SiteDeployments />,
      },
      {
        path: SiteRoutesPaths.Links,
        element: <SiteLinks />,
      },
    ],
  },
];
