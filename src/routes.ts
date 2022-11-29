import { RouteObject } from 'react-router-dom';

import { addressesRoutes } from '@pages/Addresses/routes';
import { processesRoutes } from '@pages/Processes/routes';
import { processGroupsRoutes } from '@pages/ProcessGroups/routes';
import { errorsRoutes } from '@pages/shared/Errors/routes';
import { siteRoutes } from '@pages/Sites/routes';
import { topologyRoutes } from '@pages/Topology/routes';

export const routes: RouteObject[] = [
    ...siteRoutes,
    ...addressesRoutes,
    ...processGroupsRoutes,
    ...processesRoutes,
    ...errorsRoutes,
    ...topologyRoutes,
];
