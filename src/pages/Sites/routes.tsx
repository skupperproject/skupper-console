import React, { lazy } from 'react';

import { SitesRoutesPaths } from './Sites.enum';

const SitesContainer = lazy(() => import(/* webpackChunkName: "sites-container" */ '.'));
const Sites = lazy(() => import(/* webpackChunkName: "sites" */ './views/Sites'));
const Site = lazy(() => import(/* webpackChunkName: "site" */ './views/Site'));

export const siteRoutes = [
    {
        path: SitesRoutesPaths.Sites,
        element: <SitesContainer />,
        children: [
            { index: true, element: <Sites /> },
            {
                path: SitesRoutesPaths.Sites,
                element: <Sites />,
            },
            {
                path: `${SitesRoutesPaths.Details}/:id`,
                element: <Site />,
            },
        ],
    },
];
