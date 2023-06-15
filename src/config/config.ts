import { AddressesPaths } from '@pages/Addresses/Addresses.constants';
import { ProcessesPaths } from '@pages/Processes/Processes.constant';
import { ProcessGroupsPaths } from '@pages/ProcessGroups/ProcessGroups.constant';
import { SitesPaths } from '@pages/Sites/Sites.constant';
import { TopologyPaths } from '@pages/Topology/Topology.constant';
import Logo from '@assets/skupper-logo.png';

/**  URL config: contains configuration options and constants related to backend URLs and routing */
// Base URL for the collector backend. Defaults to current host if not set in environment variables.
const BASE_URL_COLLECTOR = process.env.COLLECTOR_URL || `${window.location.protocol}//${window.location.host}`;
const API_VERSION = '/api/v1alpha1';
const PROMETHEUS_SUFFIX = '/internal/prom';

export const API_URL = `${BASE_URL_COLLECTOR}${API_VERSION}`;
export const PROMETHEUS_URL = `${API_URL}${PROMETHEUS_SUFFIX}`;

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
      refetchIntervalInBackground: true,
      suspense: false,
      staleTime: 0
    }
  }
};

/** General config: contains various global settings and constants */
export const UPDATE_INTERVAL = 7 * 1000; // Time in milliseconds to request updated data from the backend
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.'; // Error message to display when request times out

// Default page size for tables. Set in environment variables, but can be overridden.
export const DEFAULT_PAGINATION_SIZE = 10;
export const BIG_PAGINATION_SIZE = 30;
export const SMALL_PAGINATION_SIZE = 10;

// Brand
export const brandName = process.env.BRAND_APP_NAME || undefined;
export const brandLogo = process.env.BRAND_APP_LOGO ? require(process.env.BRAND_APP_LOGO) : Logo;
export const brandImg = process.env.BRAND_APP_LOGO ? require(process.env.BRAND_APP_LOGO) : Logo;
export const skupperVersion = process.env.APP_VERSION;
