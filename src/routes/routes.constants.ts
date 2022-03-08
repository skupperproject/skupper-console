import { RoutesNames, RoutesPaths } from './routes.enum';
import { RouteProps } from './routes.interfaces';

export const RoutesProps: RouteProps[] = [
  {
    path: RoutesPaths.Overview,
    name: RoutesNames.Overview,
  },
  {
    path: RoutesPaths.Services,
    name: RoutesNames.Services,
  },
  {
    path: RoutesPaths.Sites,
    name: RoutesNames.Sites,
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
