import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useRoutes } from 'react-router-dom';

import LoadingPage from '../core/components/SkLoading';
import ErrorConsole from '../pages/shared/Errors/Console';
import { routes } from '../routes';

const AppRouter = function () {
  const appRoutes = useRoutes([...routes, { path: '/', element: routes[0].element }]);
  if (!appRoutes) {
    return null;
  }

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary key={window.location.hash} onReset={reset} FallbackComponent={ErrorConsole}>
          <Suspense fallback={<LoadingPage />}>{appRoutes}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default AppRouter;
