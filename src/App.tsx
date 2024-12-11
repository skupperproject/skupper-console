import { lazy } from 'react';

import { Page } from '@patternfly/react-core';
import { AnimatePresence } from 'framer-motion';

const SkBreadcrumb = lazy(() => import('./core/components/SkBreadcrumb'));
const SkHeader = lazy(() => import('./layout/Header'));
const SkSidebar = lazy(() => import('./layout/SideBar'));
const RouteContainer = lazy(() => import('./core/AppRouter'));

import '@patternfly/react-core/dist/styles/base.css';

const App = function () {
  return (
    <Page
      masthead={<SkHeader />}
      sidebar={<SkSidebar />}
      breadcrumb={<SkBreadcrumb />}
      isContentFilled
      isManagedSidebar
    >
      <AnimatePresence mode="wait">
        <RouteContainer />
      </AnimatePresence>
    </Page>
  );
};

export default App;
