import { ErrorConnectionRoutesPaths } from './Connection/Connection.enum';
import { ErrorServerRoutesPaths } from './Server/Server.enum';

export const ErrorRoutesPaths = { ...ErrorServerRoutesPaths, ...ErrorConnectionRoutesPaths };
