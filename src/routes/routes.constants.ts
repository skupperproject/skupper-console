import { RoutesNames, RoutesPaths } from './routes.enum';
import { RouteProps } from './routes.interfaces';

export const RoutesProps: RouteProps[] = [
  {
    path: RoutesPaths.Site,
    name: RoutesNames.Site,
  },
  {
    path: RoutesPaths.Network,
    name: RoutesNames.Network,
  },
  {
    path: RoutesPaths.Services,
    name: RoutesNames.Services,
  },
  {
    path: RoutesPaths.Deployments,
    name: RoutesNames.Deployments,
  },
  {
    path: RoutesPaths.Monitoring,
    name: RoutesNames.Monitoring,
  },
];
