import { Suspense, lazy } from 'react';

import { Page, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { AnimatePresence } from 'framer-motion';

import LoadingPage from './core/components/SkLoading';
import { routes } from './routes';

const SkBreadcrumb = lazy(() => import('./core/components/SkBreadcrumb'));
const SkHeader = lazy(() => import('./layout/Header'));
const SkSidebar = lazy(() => import('./layout/SideBar'));
const RouteContainer = lazy(() => import('./layout/RouteContainer'));

import '@patternfly/react-core/dist/styles/base.css';
import './App.css';

const App = function () {
  return (
    <Page
      header={<SkHeader />}
      sidebar={<SkSidebar />}
      breadcrumb={
        <Toolbar style={{ padding: 0 }}>
          <ToolbarContent style={{ padding: 0 }}>
            <ToolbarItem>
              <SkBreadcrumb />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      }
      isManagedSidebar
      isBreadcrumbGrouped
      additionalGroupedContent={
        <Suspense fallback={<LoadingPage />}>
          <AnimatePresence mode="wait">
            <RouteContainer>{routes}</RouteContainer>
          </AnimatePresence>
        </Suspense>
      }
    />
  );
};

export default App;
