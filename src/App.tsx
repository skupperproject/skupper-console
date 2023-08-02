import { Suspense } from 'react';

import { Page } from '@patternfly/react-core';
import { ErrorBoundary } from 'react-error-boundary';

import SkBreadcrumb from '@core/components/SkBreadcrumb';
import SkHeader from '@layout/Header';
import RouteContainer from '@layout/RouteContainer';
import SkSidebar from '@layout/SideBar';
import Console from '@pages/shared/Errors/Console';
import LoadingPage from '@pages/shared/Loading';
import { routes } from 'routes';

import '@patternfly/react-core/dist/styles/base.css';
import './App.css';

const App = function () {
  return (
    <Page
      header={<SkHeader />}
      sidebar={<SkSidebar />}
      breadcrumb={<SkBreadcrumb />}
      isManagedSidebar
      isBreadcrumbGrouped
      additionalGroupedContent={
        <ErrorBoundary FallbackComponent={Console}>
          <Suspense fallback={<LoadingPage />}>
            <RouteContainer>{routes}</RouteContainer>
          </Suspense>
        </ErrorBoundary>
      }
    />
  );
};

export default App;
