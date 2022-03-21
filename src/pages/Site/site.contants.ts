import { SiteLabels, SiteRoutesPaths } from './site.enum';
import { SiteRouteProps } from './site.interfaces';

export const SiteRoutesProps: SiteRouteProps[] = [
  {
    path: SiteRoutesPaths.Overview,
    name: SiteLabels.RouteOverview,
  },
  {
    path: SiteRoutesPaths.Deployments,
    name: SiteLabels.RouteDeployments,
  },
  {
    path: SiteRoutesPaths.Links,
    name: SiteLabels.RouteLinks,
  },
];
