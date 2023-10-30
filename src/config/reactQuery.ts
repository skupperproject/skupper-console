/* eslint-disable no-console */

import { QueryClientConfig } from '@tanstack/react-query';

/** React query library config: contains configuration options for the React query library, used for fetching and caching data in the UI */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: true,
      suspense: true,
      throwOnError: true
    }
  }
};
