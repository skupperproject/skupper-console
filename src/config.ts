import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

export const UPDATE_INTERVAL = 4 * 1000; // time to request updated data to BE
export const CONNECTION_TIMEOUT = 15 * 1000; // Max time to receive a HTTP response
export const FirstLoadingView = SitesRoutesPaths.Sites; // Firs page to load when the app is open

export const BASE_URL =
    process.env.API_HOST || `${window.location.protocol}//${window.location.host}`;
//TODO: The flow collector is a beta at the moment ad it is not part of skupper yet. This URL will be removed in the future.
export const BASE_URL_FLOW_COLLECTOR = process.env.API_HOST_FLOW_COLLECTOR || BASE_URL;
