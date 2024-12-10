import { Suspense } from 'react';

import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import { loadMockServer } from '../../mocks/server';
import LoadingPage from '../../src/core/components/SkLoading';
import { Providers } from '../../src/providers';
import NotFound from '../../src/pages/shared/Errors/NotFound';
import { NotFoundLabels } from '../../src/pages/shared/Errors/NotFound/NotFound.enum';

describe('Begin testing the NotFound view', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <NotFound />
        </Suspense>
      </Providers>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Not found page', () => {
    expect(screen.getByText(NotFoundLabels.ErrorTitle)).toBeInTheDocument();
  });
});
