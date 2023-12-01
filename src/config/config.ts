import Logo from '@assets/skupper-logo.svg';

/**  URL config: contains configuration options and constants related to backend URLs and routing */
const BASE_URL_COLLECTOR = process.env.COLLECTOR_URL || `${window.location.protocol}//${window.location.host}`;
const API_VERSION = '/api/v1alpha1';
const PROMETHEUS_SUFFIX = '/internal/prom';

// Base URL for the collector backend. Defaults to current host if not set in environment variables.
export const COLLECTOR_URL = `${BASE_URL_COLLECTOR}${API_VERSION}`;
export const PROMETHEUS_URL = `${COLLECTOR_URL}${PROMETHEUS_SUFFIX}`;

export const isPrometheusActive = process.env.DISABLE_METRICS === 'true' ? false : true;

// Default page size for tables. Set in environment variables, but can be overridden.
export const DEFAULT_PAGINATION_SIZE = 10;
export const BIG_PAGINATION_SIZE = 20;
export const SMALL_PAGINATION_SIZE = 10;

// Brand
export const brandLogo = process.env.BRAND_APP_LOGO ? require(process.env.BRAND_APP_LOGO) : Logo;

/** General config: contains various global settings and constants */
export const UPDATE_INTERVAL = 9 * 1000; // Time in milliseconds to request updated data from the backend
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.'; // Error message to display when request times out

/** Tests */
export const waitForElementToBeRemovedTimeout = 3000;

export const DARK_THEME_CLASS = 'pf-v5-theme-dark';
export const DEFAULT_FONT_VAR = 'var(--pf-v5-global--FontFamily--text)';

// number of nodes to start showing the aggregate nodes in the topology
export const MAX_NODE_COUNT_WITHOUT_AGGREGATION = Number(process.env.MAX_NODE_COUNT_WITHOUT_AGGREGATION) || 31;
