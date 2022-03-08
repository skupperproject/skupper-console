import React from 'react';

import { Routes as PageRoutes, Route } from 'react-router-dom';

import Deployments from '../pages/Deployments';
import Monitoring from '../pages/Monitoring';
import NotFound from '../pages/NotFound';
import Overview from '../pages/Overview';
import Services from '../pages/Services';
import Sites from '../pages/Sites';
import { RoutesPaths } from './routes.enum';

function Routes() {
  return (
    <PageRoutes>
      <Route path="/" element={<Overview />} />
      <Route path={`${RoutesPaths.Overview}`} element={<Overview />} />
      <Route path={`${RoutesPaths.Services}`} element={<Services />} />
      <Route path={`${RoutesPaths.Sites}`} element={<Sites />} />
      <Route path={`${RoutesPaths.Deployments}`} element={<Deployments />} />
      <Route path={`${RoutesPaths.Monitoring}`} element={<Monitoring />} />
      <Route element={<NotFound />} />
    </PageRoutes>
  );
}

export default Routes;
