import React, { lazy } from 'react';

import { SitesRoutesPaths } from './Sites.enum';

const Sites = lazy(() => import(/* webpackChunkName: "sites" */ '.'));
const SitesOverview = lazy(
    () => import(/* webpackChunkName: "sites-overview" */ './views/Overview'),
);
const SiteDetails = lazy(() => import(/* webpackChunkName: "site-details" */ './views/Details'));

export const siteRoutes = [
    {
        path: SitesRoutesPaths.Sites,
        element: <Sites />,
        children: [
            { index: true, element: <SitesOverview /> },
            {
                path: SitesRoutesPaths.Overview,
                element: <SitesOverview />,
            },
            {
                path: `${SitesRoutesPaths.Details}/:id`,
                element: <SiteDetails />,
            },
        ],
    },
];
