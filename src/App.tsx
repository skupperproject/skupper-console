import React, { Suspense, useEffect } from 'react';

import { Page } from '@patternfly/react-core';
import { useLocation, useNavigate, useRoutes } from 'react-router-dom';

import Header from '@layout/Header';
import SideBar from '@layout/SideBar';
import { SiteRoutesPaths } from '@pages/Site/site.enum';

import { routes } from './routes';

import '@patternfly/patternfly/patternfly.scss';
import '@patternfly/patternfly/patternfly-addons.scss';

import './App.scss';

const App = function () {
  const appRoutes = useRoutes(routes);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === '/') {
      navigate(SiteRoutesPaths.Site);
    }
  }, [pathname, navigate]);

  return (
    <Page header={<Header />} sidebar={<SideBar />} isManagedSidebar className="app-main-container">
      <Suspense fallback={<span />}>{appRoutes}</Suspense>
    </Page>
  );
};

export default App;
