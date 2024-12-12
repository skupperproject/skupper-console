import { lazy } from 'react';

import { Page } from '@patternfly/react-core';

const SkBreadcrumb = lazy(() => import('./core/components/SkBreadcrumb'));
const SkHeader = lazy(() => import('./layout/Header'));
const SkSidebar = lazy(() => import('./layout/SideBar'));
const AppRouter = lazy(() => import('./core/AppRouter'));

const App = function () {
  return (
    <Page
      masthead={<SkHeader />}
      sidebar={<SkSidebar />}
      breadcrumb={<SkBreadcrumb />}
      isContentFilled
      isManagedSidebar
    >
      <AppRouter />
    </Page>
  );
};

export default App;
