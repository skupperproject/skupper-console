import { SiteLabels, SiteRoutesPaths } from './site.enum';

export interface SiteRouteProps {
  path: SiteRoutesPaths;
  name: Extract<
    SiteLabels,
    SiteLabels.RouteOverview | SiteLabels.RouteDeployments | SiteLabels.RouteLinks
  >;
}
