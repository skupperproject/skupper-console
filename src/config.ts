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
    SitesPaths,
    ProcessGroupsPaths,
    ProcessesPaths,
    AddressesPaths,
    TopologyPaths,
];

export const REDIRECT_TO_PATH = RoutesPropsConfig[0].path;

// React query lib config
export const queryClientConfig = {
    defaultOptions: {
        queries: {
            retry: 3,
            queries: {
                retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
            },
            refetchOnWindowFocus: false,
            refetchIntervalInBackground: false,
            suspense: false,
            staleTime: 0,
        },
    },
};

// general config
export const UPDATE_INTERVAL = 3 * 1000; // time to request updated data to BE
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.';

export const LINK_DIRECTIONS = {
    OUTGOING: 'outgoing',
    INCOMING: 'incoming',
};

export const DEFAULT_TABLE_PAGE_SIZE = Number(process.env.DEFAULT_TABLE_PAGE_SIZE) || 12; //TODO: env variable used for debugging scope
