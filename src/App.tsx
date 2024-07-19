import { Suspense } from 'react';

import { Page, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { AnimatePresence } from 'framer-motion';

import SkBreadcrumb from '@core/components/SkBreadcrumb';
import SkHeader from '@layout/Header';
import RouteContainer from '@layout/RouteContainer';
import SkSidebar from '@layout/SideBar';
import LoadingPage from '@pages/shared/Loading';
import { routes } from 'routes';

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
