import { Labels } from '../App.enum';
import { RoutesPaths } from './routes.enum';
import { RouteProps } from './routes.interfaces';

export const RoutesProps: RouteProps[] = [
  {
    path: RoutesPaths.Site,
    name: Labels.Site,
  },
  {
    path: RoutesPaths.Network,
    name: Labels.Network,
  },
  {
    path: RoutesPaths.Services,
    name: Labels.Services,
  },
  {
    path: RoutesPaths.Deployments,
    name: Labels.Deployments,
  },
  {
    path: RoutesPaths.Monitoring,
    name: Labels.Monitoring,
  },
];
