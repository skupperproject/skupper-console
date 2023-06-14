import { ReactElement } from 'react';

import { QueryCache, QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, useNavigate } from 'react-router-dom';

import { queryClientConfig } from '@config/config';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';

const QueryClientContext = function ({
  config = {},
  children
}: {
  config?: QueryClientConfig;
  children: ReactElement;
}) {
  const navigate = useNavigate();

  const queryClient = new QueryClient({
    ...queryClientConfig,
    ...config,
    queryCache: new QueryCache({
      onError: (error) => {
        handleError(error as { httpStatus?: HttpStatusErrors });
      }
    })
  });

  function handleError({
    httpStatus,
    message,
    code
  }: {
    httpStatus?: HttpStatusErrors;
    message?: string;
    code?: string;
  }) {
    const errorStatusType = httpStatus?.charAt(0);

    if (errorStatusType === '5') {
      navigate(ErrorRoutesPaths.error[HttpStatusErrors.Error5xx], { state: { httpStatus } });
    }

    if (errorStatusType === '4') {
      navigate(ErrorRoutesPaths.error[HttpStatusErrors.Error4xx], { state: { httpStatus } });
    }

    if (!errorStatusType) {
      navigate(ErrorRoutesPaths.ErrConnection, { state: { message, code } });
    }
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export const Wrapper = function ({ children, config }: { config?: QueryClientConfig; children: ReactElement }) {
  return (
    <HashRouter>
      <QueryClientContext config={config}>{children}</QueryClientContext>
    </HashRouter>
  );
};
