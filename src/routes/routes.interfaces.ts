import { Labels } from '../App.enum';
import { RoutesPaths } from './routes.enum';

export interface RouteProps {
  path: RoutesPaths;
  name: Extract<
    Labels,
    | Labels.Site
    | Labels.Network
    | Labels.Services
    | Labels.Site
    | Labels.Deployments
    | Labels.Monitoring
  >;
}
