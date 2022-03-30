import React, { useEffect } from 'react';

import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import AppContent from '@layout/AppContent';

import { SiteRoutesPaths } from './site.enum';

const Site = function () {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate(SiteRoutesPaths.Overview);
    }
  }, [pathname, navigate]);

  return (
    <AppContent>
      <Outlet />
    </AppContent>
  );
};

export default Site;
