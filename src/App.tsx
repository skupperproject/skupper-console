import { Suspense, useEffect } from 'react';

import { Page } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { setPrometheusStartTime } from '@config/Prometheus.config';
import AppMenu from '@core/components/AppMenu/AppMenu';
import AppContent from '@layout/AppContent';
import Header from '@layout/Header';
import SideBar from '@layout/SideBar';
import Console from '@pages/shared/Errors/Console';
import { TopologyRoutesPaths } from '@pages/Topology/Topology.enum';
import { routes } from 'routes';

import { REDIRECT_TO_PATH } from './config/config';

const query = 'app-getPrometheusURL';

const App = function () {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data } = useQuery([query], () => RESTApi.getPrometheusConfig(), {});

  useEffect(() => {
    if (pathname === '/') {
      navigate(REDIRECT_TO_PATH);
    }
  }, [pathname, navigate]);

  if (data) {
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
