// This file defines the navigation paths used in the application's navbar.
// The `NavigationPaths` array specifies the paths for each main section of the application, and the order in which they appear in the navbar.
// This configuration is also used to determine the default page to load when the application is first accessed.

import { ComponentsPaths } from '../pages/Components/Components.constants';
import { ProcessesPaths } from '../pages/Processes/Processes.constants';
import { ServicesPaths } from '../pages/Services/Services.constants';
import { SitesPaths } from '../pages/Sites/Sites.constants';
import { TopologyPaths } from '../pages/Topology/Topology.constants';

export const NavigationPaths = [TopologyPaths, ServicesPaths, SitesPaths, ComponentsPaths, ProcessesPaths];
