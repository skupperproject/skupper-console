import { Suspense, useEffect } from 'react';

import { Page } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';

import { isPrometheusActive, setPrometheusStartTime, setPrometheusUrl } from '@API/Prometheus.queries';
import { RESTApi } from '@API/REST';
import AppMenu from '@core/components/AppMenu/AppMenu';
import AppContent from '@layout/AppContent';
import Header from '@layout/Header';
import SideBar from '@layout/SideBar';
import Console from '@pages/shared/Errors/Console';
import { TopologyRoutesPaths } from '@pages/Topology/Topology.enum';
import { routes } from 'routes';

import { BASE_PROMETHEUS_URL, REDIRECT_TO_PATH } from './config/config';

const App = function () {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data } = useQuery(['QueriesAddresses.GetPrometheusURL'], () => RESTApi.getPrometheusConfig(), {
    enabled: !isPrometheusActive()
  });

  useEffect(() => {
    if (pathname === '/') {
      navigate(REDIRECT_TO_PATH);
    }
  }, [pathname, navigate]);

  // Sets the URL for the Prometheus used by the web application.
  // If a value is provided for BASE_PROMETHEUS_URL, it will be used as the Prometheus URL.
  // Otherwise,the code will attempt to use the url passed into the application from the API.
  setPrometheusUrl(BASE_PROMETHEUS_URL || data?.PrometheusHost);

  if (data) {
    // Sets the time when the Prometheus started to run, which is used to differentiate metrics that
    // were collected before or after the application's data was received. This helps to avoid confusion and
    // ensure that the metrics accurately reflect the application's performance.
    setPrometheusStartTime(data.startTime / 1000);
  }

  return (
    <Page
      header={<Header />}
      sidebar={<SideBar />}
      breadcrumb={pathname !== TopologyRoutesPaths.Topology && <AppMenu />}
      isManagedSidebar
      className="app-main-container"
    >
      <ErrorBoundary FallbackComponent={Console}>
        <Suspense fallback={<span />}>
          <div style={{ overflow: 'auto', flex: 1 }}>
            <AppContent>{routes}</AppContent>
          </div>
        </Suspense>
      </ErrorBoundary>
    </Page>
  );
};

export default App;
