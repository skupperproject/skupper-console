import React, { lazy } from 'react';

import { SiteRoutesPaths } from './sites.enum';

const Sites = lazy(() => import(/* webpackChunkName: "sites" */ '.'));
const SitesOverview = lazy(
    () => import(/* webpackChunkName: "sites-overview" */ './views/Overview'),
);
const SiteDetails = lazy(() => import(/* webpackChunkName: "site-detail" */ './views/Details'));

export const siteRoutes = [
    {
        path: SiteRoutesPaths.Sites,
        element: <Sites />,
        children: [
            { index: true, element: <SitesOverview /> },
            {
                path: SiteRoutesPaths.Overview,
                element: <SitesOverview />,
            },
            {
                path: `${SiteRoutesPaths.Details}/:id`,
                element: <SiteDetails />,
            },
        ],
    },
];
