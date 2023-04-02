import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';

import { queryClientConfig } from '@config/config';

export const QueryClientContext = function ({ children }: { children: React.ReactElement }) {
  const queryClient = new QueryClient(queryClientConfig);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export const Wrapper = function ({ children }: { children: React.ReactElement }) {
  return (
    <QueryClientContext>
      <HashRouter>{children}</HashRouter>
    </QueryClientContext>
  );
};
