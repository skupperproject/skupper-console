import React from 'react';

import { Link, Outlet } from 'react-router-dom';

import AppContent from '@layout/AppContent';

import SiteMenu from './components/SiteMenu';
import { SiteLabels, SiteRoutesPaths } from './site.enum';

const Site = function () {
  return (
    <AppContent header={<SiteMenu />}>
      <Link to={SiteRoutesPaths.Overview}>{SiteLabels.RouteOverview}</Link>
      <Link to={SiteRoutesPaths.Deployments}>{SiteLabels.RouteDeployments}</Link>
      <Link to={SiteRoutesPaths.Links}>{SiteLabels.RouteLinks}</Link>
      <Outlet />
    </AppContent>
  );
};

export default Site;
