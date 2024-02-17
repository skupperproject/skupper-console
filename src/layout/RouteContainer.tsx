import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useRoutes, RouteObject } from 'react-router-dom';

import ErrorConsole from '@pages/shared/Errors/Console';

interface RouteProps {
  children: RouteObject[];
}

const RouteContainer = function ({ children: routes }: RouteProps) {
  const appRoutes = useRoutes([...routes, { path: '/', element: routes[0].element }]);
  if (!appRoutes) {
    return null;
  }

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary key={window.location.hash} onReset={reset} FallbackComponent={ErrorConsole}>
          {appRoutes}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default RouteContainer;
