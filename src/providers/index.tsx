import { ReactElement } from 'react';

import { QueryClientConfig } from '@tanstack/react-query';

import { FetchClientProvider } from './FetchClientProvider';
import { RouterProvider } from './RouterProvider';

export const Providers = function ({ children, config }: { config?: QueryClientConfig; children: ReactElement }) {
  return (
    <RouterProvider>
      <FetchClientProvider config={config}>{children}</FetchClientProvider>
    </RouterProvider>
  );
};
