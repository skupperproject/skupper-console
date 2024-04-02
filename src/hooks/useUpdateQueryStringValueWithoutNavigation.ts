import { useLocation } from 'react-router-dom';

function useUpdateQueryStringValueWithoutNavigation(
  queryKey: string,
  queryValue: string,
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
