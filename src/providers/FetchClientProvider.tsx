import { ReactNode } from 'react';

import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';

import { queryClientConfig } from '../config/reactQuery';

export const FetchClientProvider = function ({
  config = {},
  children
}: {
  config?: QueryClientConfig;
  children: ReactNode;
}) {
  const queryClient = new QueryClient({
    ...queryClientConfig,
    ...config
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
