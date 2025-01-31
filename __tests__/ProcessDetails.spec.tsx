import { Suspense } from 'react';

import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import processesData from '../mocks/data/PROCESSES.json';
import { loadMockServer } from '../mocks/server';
import LoadingPage from '../src/core/components/SkLoading';
import Details from '../src/pages/Processes/components/Details';
import { Providers } from '../src/providers';
import { ProcessResponse } from '../src/types/REST.interfaces';
import { setMockUseParams } from '../vite.setup';

const processResult = processesData.results[0] as ProcessResponse;

setMockUseParams({ id: `${processResult.name}@${processResult.identity}` });

describe('Process component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Details process={processResult} />
        </Suspense>
      </Providers>
    );
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('should render the title, description data and processes associated the data loading is complete', async () => {
    expect(screen.getByText(processResult.siteName)).toBeInTheDocument();
    expect(screen.getByText(processResult.componentName)).toBeInTheDocument();
    expect(screen.getByText(processResult.hostName as string)).toBeInTheDocument();
    expect(screen.getByText(processResult.sourceHost)).toBeInTheDocument();
  });
});
