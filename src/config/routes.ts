import { ServicesPaths } from '@pages/Addresses/Services.constants';
import { ProcessesPaths } from '@pages/Processes/Processes.constants';
import { ProcessGroupsPaths } from '@pages/ProcessGroups/ProcessGroups.constants';
import { SitesPaths } from '@pages/Sites/Sites.constants';
import { TopologyPaths } from '@pages/Topology/Topology.constants';

// Navigation config
export const ROUTES = [TopologyPaths, ServicesPaths, SitesPaths, ProcessGroupsPaths, ProcessesPaths];
export const DEFAULT_ROUTE = ROUTES[0].path;
