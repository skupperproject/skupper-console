import { ReactNode } from 'react';

import { HashRouter } from 'react-router-dom';

export const RouterProvider = function ({ children }: { children: ReactNode }) {
  return <HashRouter>{children}</HashRouter>;
};
