import { AddressesPaths } from '@pages/Addresses/Addresses.constants';
import { ProcessesPaths } from '@pages/Processes/Processes.constant';
import { ProcessGroupsPaths } from '@pages/ProcessGroups/ProcessGroups.constant';
import { SitesPaths } from '@pages/Sites/Sites.constant';
import { TopologyPaths } from '@pages/Topology/Topology.constant';
import Logo from '@assets/skupper.svg';

/**  URL config: contains configuration options and constants related to backend URLs and routing */
// Base URL for the collector backend. Defaults to current host if not set in environment variables.
const BASE_URL_COLLECTOR = process.env.COLLECTOR_URL || `${window.location.protocol}//${window.location.host}`;
// Base URL for the Prometheus backend. Set in environment variables.
export const BASE_PROMETHEUS_URL = process.env.PROMETHEUS_URL;

const API_VERSION = '/api/v1alpha1';
export const API_URL = `${BASE_URL_COLLECTOR}${API_VERSION}`;

// Navigation config
export const RoutesPropsConfig = [TopologyPaths, AddressesPaths, SitesPaths, ProcessGroupsPaths, ProcessesPaths];
// Default URL path to redirect to. Set to the path for the first page.
export const REDIRECT_TO_PATH = RoutesPropsConfig[0].path;

/** React query library config: contains configuration options for the React query library, used for fetching and caching data in the UI */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 3,
      queries: {
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
      },
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      suspense: false,
      staleTime: 0
    }
  }
};

/** General config: contains various global settings and constants */
export const UPDATE_INTERVAL = 7 * 1000; // Time in milliseconds to request updated data from the backend
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.'; // Error message to display when request times out

// Default page size for tables. Set in environment variables, but can be overridden.
export const DEFAULT_TABLE_PAGE_SIZE = Number(process.env.DEFAULT_TABLE_PAGE_SIZE) || 10; //TODO: env variable used for debugging scope

// Brand
export const brandName = process.env.BRAND_APP_NAME !== undefined ? process.env.BRAND_APP_NAME : 'Skupper';
export const brandLogo = process.env.BRAND_APP_LOGO ? require(process.env.BRAND_APP_LOGO) : Logo;
export const brandImg = process.env.BRAND_APP_LOGO ? require(process.env.BRAND_APP_LOGO) : Logo;

export const skupperVersion = process.env.APP_VERSION;
