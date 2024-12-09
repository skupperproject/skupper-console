import { QueryObserverOptions } from '@tanstack/react-query';

interface QueryClientConfig {
  defaultOptions: { queries: QueryObserverOptions };
}

/** React query library config: contains configuration options for the React query library, used for fetching and caching data in the UI */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: true,
      suspense: false,
      throwOnError: true,
      queryKey: []
    }
  }
};

export const UPDATE_INTERVAL = 0 * 1000; // React query: Time in milliseconds to polling data from the backend
