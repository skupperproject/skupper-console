import { Suspense } from 'react';

import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import { loadMockServer } from '../../mocks/server';
import LoadingPage from '../../src/core/components/SkLoading';
import { Providers } from '../../src/providers';
import ErrorConsole from '../../src/pages/shared/Errors/Console';

describe('Begin testing the Error Console view', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the error Console page as javascript stack error', () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <ErrorConsole
            error={{ message: 'javascript error', stack: 'stack trace description' }}
            resetErrorBoundary={jest.fn()}
          />
        </Suspense>
      </Providers>
    );

    expect(screen.getByText('javascript error')).toBeInTheDocument();
    expect(screen.getByText('stack trace description')).toBeInTheDocument();
  });

  it('should render the error Console page as Network error when code = ERR_NETWORK', () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <ErrorConsole error={{ code: 'ERR_NETWORK' }} resetErrorBoundary={jest.fn()} />
        </Suspense>
      </Providers>
    );

    expect(screen.getByText('ERR_NETWORK')).toBeInTheDocument();
  });

  it('should render the error Console page as HTTP status error', () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <ErrorConsole
            error={{ message: 'http network', httpStatus: '500', code: '' }}
            resetErrorBoundary={jest.fn()}
          />
        </Suspense>
      </Providers>
    );

    expect(screen.getByText('http network')).toBeInTheDocument();
  });
});
