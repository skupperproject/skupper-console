import React, { lazy } from 'react';

import { ProcessGroupsRoutesPaths } from './ProcessGroups.enum';

const ProcessGroupsContainer = lazy(
    () => import(/* webpackChunkName: "processGroups-container" */ '.'),
);
const ProcessGroups = lazy(
    () => import(/* webpackChunkName: "processGroups" */ './views/ProcessGroups'),
);
const ProcessGroup = lazy(
    () => import(/* webpackChunkName: "processGroup" */ './views/ProcessGroup'),
);

export const processGroupsRoutes = [
    {
        path: ProcessGroupsRoutesPaths.ProcessGroups,
        element: <ProcessGroupsContainer />,
        children: [
            { index: true, element: <ProcessGroups /> },
            {
                path: ProcessGroupsRoutesPaths.ProcessGroups,
                element: <ProcessGroups />,
            },
            {
                path: `${ProcessGroupsRoutesPaths.ProcessGroups}/:id`,
                element: <ProcessGroup />,
            },
        ],
    },
];
