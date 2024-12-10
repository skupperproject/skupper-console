import { Suspense, lazy } from 'react';

import { Page } from '@patternfly/react-core';
import { AnimatePresence } from 'framer-motion';

import LoadingPage from './core/components/SkLoading';

const SkBreadcrumb = lazy(() => import('./core/components/SkBreadcrumb'));
const SkHeader = lazy(() => import('./layout/Header'));
const SkSidebar = lazy(() => import('./layout/SideBar'));
const RouteContainer = lazy(() => import('./layout/RouteContainer'));

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
      <Suspense fallback={<LoadingPage />}>
        <AnimatePresence mode="wait">
          <RouteContainer />
        </AnimatePresence>
      </Suspense>
    </Page>
  );
};

export default App;
