import React from 'react';

import { Routes as PageRoutes, Route, Navigate } from 'react-router-dom';

import Deployments from '../pages/Deployments';
import ErrorConnection from '../pages/ErrorConnection';
import ErrorServer from '../pages/ErrorServer';
import Monitoring from '../pages/Monitoring';
import Network from '../pages/Network';
import NotFound from '../pages/NotFound';
import Services from '../pages/Services';
import Site from '../pages/Site';
import { RoutesPaths } from './routes.enum';

function Routes() {
  return (
    <PageRoutes>
      <Route path="/" element={<Navigate to={RoutesPaths.Site} />} />
      <Route path={`${RoutesPaths.Network}`} element={<Network />} />
      <Route path={`${RoutesPaths.Services}`} element={<Services />} />
      <Route path={`${RoutesPaths.Site}`} element={<Site />} />
      <Route path={`${RoutesPaths.Deployments}`} element={<Deployments />} />
      <Route path={`${RoutesPaths.Monitoring}`} element={<Monitoring />} />
      <Route path={`${RoutesPaths.ErrConnection}`} element={<ErrorConnection />} />
      <Route path={`${RoutesPaths.ErrServer}`} element={<ErrorServer />} />
      <Route path="*" element={<NotFound />} />
    </PageRoutes>
  );
}

export default Routes;
