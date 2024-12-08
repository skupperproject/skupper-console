import Logo from '../assets/skupper-logo.svg';

/** Brand */
export const brandLogo = process.env.BRAND_APP_LOGO ? require(process.env.BRAND_APP_LOGO) : Logo;

/** Default page size for tables */
export const DEFAULT_PAGINATION_SIZE = 10;
export const BIG_PAGINATION_SIZE = 20;
export const SMALL_PAGINATION_SIZE = 10;

export const EMPTY_VALUE_SYMBOL = '-';
export const DEFAULT_COMPLEX_STRING_SEPARATOR = '@'; // process -> addresses format and connector name format

/** Tests */
export const waitForElementToBeRemovedTimeout = 10000;
