import { ErrorConnectionRoutesPaths } from './Connection/Connection.enum';
import { NotFoundRoutesPaths } from './NotFound/NotFound.enum';
import { ErrorServerRoutesPaths } from './Server/Server.enum';

export enum HttpStatusErrors {
    NotFound = '404',
    ServerError = '500',
    ServiceUnavailable = '503',
}
export const ErrorRoutesPaths = {
    error: {
        [HttpStatusErrors.ServerError]: ErrorServerRoutesPaths.ErrServer,
        [HttpStatusErrors.ServiceUnavailable]: ErrorServerRoutesPaths.ErrServer,
        [HttpStatusErrors.NotFound]: NotFoundRoutesPaths.NotFound,
    },
    ...ErrorConnectionRoutesPaths,
};
