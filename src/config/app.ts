import Logo from '../assets/skupper-logo.svg';

// Default page size for tables. Set in environment variables, but can be overridden.
export const DEFAULT_PAGINATION_SIZE = 10;
export const BIG_PAGINATION_SIZE = 20;
export const SMALL_PAGINATION_SIZE = 10;

// Brand
export const brandLogo = process.env.BRAND_APP_LOGO ? require(process.env.BRAND_APP_LOGO) : Logo;

/** General config: contains various global settings and constants */
export const UPDATE_INTERVAL = 0 * 1000; // Time in milliseconds to request updated data from the backend
export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.'; // Error message to display when request times out

/** Tests */
export const waitForElementToBeRemovedTimeout = 10000;

export const EMPTY_VALUE_PLACEHOLDER = '-';
export const IDS_GROUP_SEPARATOR = '~';
export const IDS_MULTIPLE_SELECTION_SEPARATOR = ',';
export const PAIR_SEPARATOR = 'processpair-';
export const DEFAULT_COMPLEX_STRING_SEPARATOR = '@';

export const MIN_DRAWER_WIDTH = 500;
export const MAX_DRAWER_WIDTH = 800;
