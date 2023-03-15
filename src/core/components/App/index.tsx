import React, { Suspense, useEffect } from 'react';

import { Page } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import AppContent from '@layout/AppContent';
import Header from '@layout/Header';
import SideBar from '@layout/SideBar';
import { setPrometheusUrl } from 'API/Prometheus.constant';
import { RESTApi } from 'API/REST';
import { BASE_PROMETHEUS_URL, REDIRECT_TO_PATH } from 'config';
import { routes } from 'routes';

import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/patternfly-addons.css';

import './App.css';

const App = function () {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: url } = useQuery(['QueriesAddresses.GetPrometheusURL'], () => RESTApi.getPrometheusUrl(), {
    enabled: !BASE_PROMETHEUS_URL
  });

  useEffect(() => {
    if (pathname === '/') {
      navigate(REDIRECT_TO_PATH);
    }
  }, [pathname, navigate]);

  if (!BASE_PROMETHEUS_URL) {
    setPrometheusUrl(BASE_PROMETHEUS_URL || url || '');
  }

  return (
    <Page header={<Header />} sidebar={<SideBar />} isManagedSidebar className="app-main-container">
      <Suspense fallback={<span />}>
        <AppContent>{routes}</AppContent>
      </Suspense>
    </Page>
  );
};

export default App;
