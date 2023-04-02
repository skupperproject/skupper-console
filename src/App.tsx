import React, { Suspense, useEffect } from 'react';

import { Divider, Page } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import AppMenu from '@core/components/AppMenu/AppMenu';
import AppContent from '@layout/AppContent';
import Header from '@layout/Header';
import SideBar from '@layout/SideBar';
import { isPrometheusActive, setPrometheusStartTime, setPrometheusUrl } from 'API/Prometheus.constant';
import { routes } from 'routes';

import { BASE_PROMETHEUS_URL, REDIRECT_TO_PATH } from './config';

import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/patternfly-addons.css';
import './App.css';

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

  setPrometheusUrl(BASE_PROMETHEUS_URL || data?.PrometheusHost || '');

  if (data) {
    setPrometheusStartTime(data.startTime / 1000);
  }

  return (
    <Page header={<Header />} sidebar={<SideBar />} isManagedSidebar className="app-main-container">
      <Suspense fallback={<span />}>
        <div className="pf-u-mx-md pf-u-mt-md">
          <AppMenu />
        </div>
        <Divider />
        <div style={{ overflow: 'auto', flex: 1 }}>
          <AppContent>{routes}</AppContent>
        </div>
      </Suspense>
    </Page>
  );
};

export default App;
