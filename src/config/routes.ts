import { ProcessesPaths } from '@pages/Processes/Processes.constants';
import { ComponentsPaths } from '@pages/ProcessGroups/Components.constants';
import { ServicesPaths } from '@pages/Services/Services.constants';
import { SitesPaths } from '@pages/Sites/Sites.constants';
import { TopologyPaths } from '@pages/Topology/Topology.constants';

// Navigation config
export const ROUTES = [TopologyPaths, SitesPaths, ServicesPaths, ProcessesPaths, ComponentsPaths];
export const DEFAULT_ROUTE = ROUTES[0].path;
