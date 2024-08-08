import { Suspense } from 'react';

import { render } from '@testing-library/react';
import { Server } from 'miragejs';

import { Wrapper } from '@core/components/Wrapper';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';
import DisplayServices from '@pages/Topology/components/DisplayServices';

describe('DisplayServices', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('renders DisplayServices component placehoder without service options an disabled', () => {
    const { getByRole } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <DisplayServices initialIdsSelected={undefined} onSelected={jest.fn()} />
        </Suspense>
      </Wrapper>
    );

    const selectElement = getByRole('togglebox');
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveAttribute('disabled');
  });
});
