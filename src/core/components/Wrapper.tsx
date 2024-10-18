import { ReactElement } from 'react';

import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';

import { queryClientConfig } from '../../config/reactQuery';

const QueryClientContext = function ({
  config = {},
  children
}: {
  config?: QueryClientConfig;
  children: ReactElement;
}) {
  const queryClient = new QueryClient({
    ...queryClientConfig,
    ...config
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export const Wrapper = function ({ children, config }: { config?: QueryClientConfig; children: ReactElement }) {
  return (
    <HashRouter>
      <QueryClientContext config={config}>{children}</QueryClientContext>
    </HashRouter>
  );
};
