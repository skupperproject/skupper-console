import { ErrorConnectionRoutesPaths } from './Connection/Connection.enum';
import { NotFoundRoutesPaths } from './NotFound/NotFound.enum';
import { ErrorServerRoutesPaths } from './Server/Server.enum';

export enum HttpStatusErrors {
  NotFound = '404',
  ServiceUnavailable = '503',
  Error5xx = 'server-error',
  Error4xx = 'client-error'
}
export const ErrorRoutesPaths = {
  error: {
    [HttpStatusErrors.Error5xx]: ErrorServerRoutesPaths.ErrServer,
    [HttpStatusErrors.ServiceUnavailable]: ErrorServerRoutesPaths.ErrServer,
    [HttpStatusErrors.NotFound]: NotFoundRoutesPaths.NotFound,
    [HttpStatusErrors.Error4xx]: NotFoundRoutesPaths.NotFound
  },
  ...ErrorConnectionRoutesPaths
};
