import React, { lazy } from 'react';

import { SitesRoutesPaths } from './Sites.enum';

const Sites = lazy(() => import(/* webpackChunkName: "sites" */ './views/Sites'));
const Site = lazy(() => import(/* webpackChunkName: "site" */ './views/Site'));

export const siteRoutes = [
    {
        path: SitesRoutesPaths.Sites,
        element: <Sites />,
    },
    {
        path: `${SitesRoutesPaths.Sites}/:id`,
        element: <Site />,
    },
];
