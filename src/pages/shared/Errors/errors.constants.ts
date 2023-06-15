import { ErrorConnectionRoutesPaths } from './Connection/Connection.enum';
import { ErrorHttpRoutesPaths } from './Http/Http.enum';

export const ErrorRoutesPaths = {
  error: {
    ...ErrorHttpRoutesPaths,
    ...ErrorConnectionRoutesPaths
  }
};
