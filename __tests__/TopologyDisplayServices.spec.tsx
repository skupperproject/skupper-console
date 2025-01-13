import { Suspense } from 'react';

import { render } from '@testing-library/react';
import { Server } from 'miragejs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadMockServer } from '../mocks/server';
import LoadingPage from '../src/core/components/SkLoading';
import DisplayServices from '../src/pages/Topology/components/DisplayServices';
import { Providers } from '../src/providers';

describe('DisplayServices', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('renders DisplayServices component placehoder without service options an disabled', () => {
    const { getByRole } = render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <DisplayServices initialIdsSelected={undefined} onSelected={vi.fn()} />
        </Suspense>
      </Providers>
    );

    const selectElement = getByRole('togglebox');
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveAttribute('disabled');
  });
});
