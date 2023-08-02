import Logo from '@assets/skupper-logo.png';
import { AddressesPaths } from '@pages/Addresses/Addresses.constant';
import { ProcessesPaths } from '@pages/Processes/Processes.constant';
import { ProcessGroupsPaths } from '@pages/ProcessGroups/ProcessGroups.constant';
import { SitesPaths } from '@pages/Sites/Sites.constant';
import { TopologyPaths } from '@pages/Topology/Topology.constant';

/**  URL config: contains configuration options and constants related to backend URLs and routing */
const BASE_URL_COLLECTOR = process.env.COLLECTOR_URL || `${window.location.protocol}//${window.location.host}`;
const API_VERSION = '/api/v1alpha1';
const PROMETHEUS_SUFFIX = '/internal/prom';

// Base URL for the collector backend. Defaults to current host if not set in environment variables.
export const COLLECTOR_URL = `${BASE_URL_COLLECTOR}${API_VERSION}`;
export const PROMETHEUS_URL = `${COLLECTOR_URL}${PROMETHEUS_SUFFIX}`;

// Navigation config
export const ROUTES = [TopologyPaths, AddressesPaths, SitesPaths, ProcessGroupsPaths, ProcessesPaths];
export const DEFAULT_ROUTE = ROUTES[0].path;

export const isPrometheusActive = process.env.DISABLE_METRICS === 'true' ? false : true;

// Default page size for tables. Set in environment variables, but can be overridden.
export const DEFAULT_PAGINATION_SIZE = 10;
export const BIG_PAGINATION_SIZE = 20;
export const SMALL_PAGINATION_SIZE = 10;

// Brand
export const brandName = process.env.BRAND_APP_NAME || undefined;
export const brandLogo = process.env.BRAND_APP_LOGO ? require(process.env.BRAND_APP_LOGO) : Logo;

/** General config: contains various global settings and constants */
export const UPDATE_INTERVAL = 7 * 1000; // Time in milliseconds to request updated data from the backend
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.'; // Error message to display when request times out
