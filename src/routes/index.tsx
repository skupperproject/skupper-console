import React, { lazy, Suspense } from 'react';

import { Routes as PageRoutes, Route, Navigate } from 'react-router-dom';

const Site = lazy(() => import('@pages/Site'));
const Network = lazy(() => import('@pages/Network'));
const Services = lazy(() => import('@pages/Services'));
const Deployments = lazy(() => import('@pages/Deployments'));
const Monitoring = lazy(() => import('@pages/Monitoring'));
const ErrorConnection = lazy(() => import('@pages/Errors/ErrorConnection'));
const ErrorServer = lazy(() => import('@pages/Errors/ErrorServer'));
const NotFound = lazy(() => import('@pages/NotFound'));

import { RoutesPaths } from './routes.enum';

const Routes = function () {
  return (
    <Suspense fallback={<div />}>
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
    </Suspense>
  );
};

export default Routes;
