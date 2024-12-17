import Logo from '../assets/skupper-logo.svg';

/** Brand */
export const brandLogo = process.env.BRAND_APP_LOGO ? require(process.env.BRAND_APP_LOGO) : Logo;

/** Default page size for tables */
export const BIG_PAGINATION_SIZE = 20;
export const SMALL_PAGINATION_SIZE = 10;

export const EMPTY_VALUE_SYMBOL = '-';
export const DEFAULT_COMPLEX_STRING_SEPARATOR = '@'; // used for: 1) process -> services format and 2) connector name format

/** Tests */
export const waitForElementToBeRemovedTimeout = 10000;
