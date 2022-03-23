import React, { useEffect } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import AppContent from '@layout/AppContent';

import NavBarSite from './components/NavBar';
import SiteMenu from './components/SiteMenu';
import { SiteRoutesPaths } from './site.enum';

const Site = function () {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (location.pathname === SiteRoutesPaths.Site) {
      navigate(SiteRoutesPaths.Overview);
    }
  }, [pathname, navigate]);

  return (
    <AppContent header={<SiteMenu />}>
      <Stack>
        <StackItem className="pf-u-mb-2xl">
          <NavBarSite />
        </StackItem>
        <StackItem>
          <Outlet />
        </StackItem>
      </Stack>
    </AppContent>
  );
};

export default Site;
