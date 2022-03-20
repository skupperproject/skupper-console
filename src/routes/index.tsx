import React, { lazy, Suspense } from 'react';

import { Routes as PageRoutes, Route, Navigate } from 'react-router-dom';

const Site = lazy(() => import(/* webpackChunkName: "sites" */ '@pages/Site'));
const Network = lazy(() => import(/* webpackChunkName: "network" */ '@pages/Network'));
const Services = lazy(() => import(/* webpackChunkName: "services" */ '@pages/Services'));
const Deployments = lazy(() => import(/* webpackChunkName: "deployments" */ '@pages/Deployments'));
const Monitoring = lazy(() => import(/* webpackChunkName: "monitoring" */ '@pages/Monitoring'));
const NotFound = lazy(() => import(/* webpackChunkName: "not found" */ '@pages/NotFound'));
const ErrorConnection = lazy(
  () => import(/* webpackChunkName: "connection-error" */ '@pages/Errors/ErrorConnection'),
);
const ErrorServer = lazy(
  () => import(/* webpackChunkName: "server error" */ '@pages/Errors/ErrorServer'),
);

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
