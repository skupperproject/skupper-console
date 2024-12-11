import { lazy } from 'react';

import { ProcessesRoutesPaths } from '../pages/Processes/Processes.enum';

const Processes = lazy(() => import(/* webpackChunkName: "processes" */ '../pages/Processes/views/Processes'));
const Process = lazy(() => import(/* webpackChunkName: "process" */ '../pages/Processes/views/Process'));
const ProcessPair = lazy(() => import(/* webpackChunkName: "process-pair" */ '../pages/Processes/views/ProcessPair'));

export const processesRoutes = [
  {
    path: ProcessesRoutesPaths.Processes,
    element: <Processes />
  },
  {
    path: `${ProcessesRoutesPaths.Processes}/:id`,
    element: <Process />
  },
  {
    path: `${ProcessesRoutesPaths.Processes}/:process/:id`,
    element: <ProcessPair />
  }
];
