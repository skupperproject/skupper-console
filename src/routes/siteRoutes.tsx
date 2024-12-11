import { lazy } from 'react';

import { SitesRoutesPaths } from '../pages/Sites/Sites.enum';

const Sites = lazy(() => import(/* webpackChunkName: "sites" */ '../pages/Sites/views/Sites'));
const Site = lazy(() => import(/* webpackChunkName: "site" */ '../pages/Sites/views/Site'));

export const siteRoutes = [
  {
    path: SitesRoutesPaths.Sites,
    element: <Sites />
  },
  {
    path: `${SitesRoutesPaths.Sites}/:id`,
    element: <Site />
  }
];
