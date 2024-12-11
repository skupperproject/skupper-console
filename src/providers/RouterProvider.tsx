import { ReactNode } from 'react';

import { HashRouter } from 'react-router-dom';

export const RouterProvider = function ({ children }: { children: ReactNode }) {
  return (
    <HashRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true
      }}
    >
      {children}
    </HashRouter>
  );
};
