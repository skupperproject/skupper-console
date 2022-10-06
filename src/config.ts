import { AddressesPaths } from '@pages/Addresses/Addresses.constants';
import { ProcessesPaths } from '@pages/Processes/Processes.constant';
import { ProcessGroupsPaths } from '@pages/ProcessGroups/ProcessGroups.constant';
import { SitesPaths } from '@pages/Sites/Sites.constant';
import { TopologyPaths } from '@pages/Topology/Topology.constant';

// URL config
export const BASE_URL_COLLECTOR =
    process.env.API_HOST_FLOW_COLLECTOR || `${window.location.protocol}//${window.location.host}`;

// Navigation config
export const RoutesPropsConfig = [
    TopologyPaths,
    SitesPaths,
    ProcessGroupsPaths,
    ProcessesPaths,
    AddressesPaths,
];

export const DEFAULT_VIEW = RoutesPropsConfig[0].path; // Firs page to load when the app is open

// React query lib config
export const queryClientConfig = {
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,
            suspense: false,
            staleTime: 0,
        },
    },
};

// general config
export const UPDATE_INTERVAL = 4 * 1000; // time to request updated data to BE
export const CONNECTION_TIMEOUT = 15 * 1000; // Max time to receive a HTTP response
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

export const LINK_DIRECTIONS = {
    OUTGOING: 'outgoing',
    INCOMING: 'incoming',
};
