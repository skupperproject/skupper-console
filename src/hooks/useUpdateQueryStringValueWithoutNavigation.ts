import { useLocation } from 'react-router-dom';

// modify the query string in the browser's URL without causing a page reload or navigation
// It's mainly used to avoid reloading the page when the query string changes (e.g. switch tabs)
function useUpdateQueryStringValueWithoutNavigation(
  queryKey: string,
  queryValue: string,
  // it indicates that the current URL's query string should be completely reset
  // (i.e., all existing query parameters are removed) before setting a new query parameter.
  resetQueryString: boolean = false
) {
  const location = useLocation();
  const currentQueryString = resetQueryString ? '' : location.search;
  const newQueryString = new URLSearchParams(currentQueryString);

  // Set the value of the specified parameter
  newQueryString.set(queryKey, queryValue);

  // Build the new URL with the updated query string
  const newUrl = `#${location.pathname}?${newQueryString.toString()}`;

  window.history.replaceState(null, '', newUrl);
}

export default useUpdateQueryStringValueWithoutNavigation;
