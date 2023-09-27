import { Suspense } from 'react';

import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import { Wrapper } from '@core/components/Wrapper';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import NotFound from '../NotFound';
import { NotFoundLabels } from '../NotFound/NotFound.enum';

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
