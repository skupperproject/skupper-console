import { Suspense } from 'react';

import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import { loadMockServer } from '../../mocks/server';
import { Wrapper } from '../../src/core/components/Wrapper';
import NotFound from '../../src/pages/shared/Errors/NotFound';
import { NotFoundLabels } from '../../src/pages/shared/Errors/NotFound/NotFound.enum';
import LoadingPage from '../../src/pages/shared/Loading';

describe('Begin testing the NotFound view', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <NotFound />
        </Suspense>
      </Wrapper>
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
