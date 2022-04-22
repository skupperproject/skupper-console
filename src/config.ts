import { NetworkRoutesPaths } from '@pages/Network/Network.enum';

export const UPDATE_INTERVAL = 3 * 1000; // time to request updated data to BE
export const CONNECTION_TIMEOUT = 10 * 1000; // Max time to receive a HTTP response
export const FirstLoadingView = NetworkRoutesPaths.Network; // Firs page to load when the app is open
