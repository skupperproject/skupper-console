import { lazy } from 'react';

import { ProcessesRoutesPaths } from './Processes.enum';

const Processes = lazy(() => import(/* webpackChunkName: "processes" */ './views/Processes'));
const Process = lazy(() => import(/* webpackChunkName: "process" */ './views/Process'));
const ProcessPair = lazy(() => import(/* webpackChunkName: "process-pair" */ './views/ProcessPair'));

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
