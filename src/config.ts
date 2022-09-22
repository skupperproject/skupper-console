import { RoutesProps } from '@core/components/NavBar/NavBar.constants';

export const UPDATE_INTERVAL = 4 * 1000; // time to request updated data to BE
export const CONNECTION_TIMEOUT = 15 * 1000; // Max time to receive a HTTP response
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';
export const DEFAULT_VIEW = RoutesProps[0].path; // Firs page to load when the app is open

export const LINK_DIRECTIONS = {
    OUTGOING: 'outgoing',
    INCOMING: 'incoming',
};

export const BASE_URL =
    process.env.API_HOST || `${window.location.protocol}//${window.location.host}`;
export const BASE_URL_COLLECTOR = process.env.API_HOST_FLOW_COLLECTOR || BASE_URL;

export const queryClientConfig = {
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,
            suspense: false,
            staleTime: Infinity,
        },
    },
};
