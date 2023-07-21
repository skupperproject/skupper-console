import { Suspense } from 'react';

import { Page } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

import { RESTApi } from '@API/REST.api';
import { setCollectorStartTime } from '@config/config';
import AppMenu from '@core/components/AppMenu/AppMenu';
import AppContent from '@layout/AppContent';
import SkHeader from '@layout/Header';
import SkSidebar from '@layout/SideBar';
import Console from '@pages/shared/Errors/Console';
import { routes } from 'routes';

const App = function () {
  const { data: collector } = useQuery(['app-getPrometheusURL'], () => RESTApi.fetchCollectors());

  if (collector) {
    setCollectorStartTime(collector.startTime / 1000);
  }

  return (
    <Page header={<SkHeader />} sidebar={<SkSidebar />} breadcrumb={<AppMenu />} isManagedSidebar>
      <ErrorBoundary FallbackComponent={Console}>
        <Suspense fallback={<span />}>
          <AppContent>{routes}</AppContent>
        </Suspense>
      </ErrorBoundary>
    </Page>
  );
};

export default App;
