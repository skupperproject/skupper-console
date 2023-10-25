import { Suspense } from 'react';

import { Page } from '@patternfly/react-core';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

import SkBreadcrumb from '@core/components/SkBreadcrumb';
import { getThemePreference, reflectThemePreference } from '@core/utils/isDarkTheme';
import SkHeader from '@layout/Header';
import RouteContainer from '@layout/RouteContainer';
import SkSidebar from '@layout/SideBar';
import ErrorConsole from '@pages/shared/Errors/Console';
import LoadingPage from '@pages/shared/Loading';
import { routes } from 'routes';

import '@patternfly/react-core/dist/styles/base.css';
import './App.css';

const App = function () {
  reflectThemePreference(getThemePreference());

  return (
    <Page
      header={<SkHeader />}
      sidebar={<SkSidebar />}
      breadcrumb={<SkBreadcrumb />}
      isManagedSidebar
      isBreadcrumbGrouped
      additionalGroupedContent={
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary onReset={reset} FallbackComponent={ErrorConsole}>
              <Suspense fallback={<LoadingPage />}>
                <RouteContainer>{routes}</RouteContainer>
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      }
    />
  );
};

export default App;
