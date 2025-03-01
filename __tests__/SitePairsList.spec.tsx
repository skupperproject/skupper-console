import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import pairsList from '../mocks/data/SITE_PAIRS.json';
import sites from '../mocks/data/SITES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import PairsList from '../src/pages/Sites/components/PairList';
import { Providers } from '../src/providers';
import { BasePairs, SiteResponse } from '../src/types/REST.interfaces';

const data = sites.results[0] as SiteResponse;
const dataNoPairs = {
  endTime: 0,
  identity: 'no-pairs',
  name: 'no-pairs',
  startTime: 1728076321000000
} as SiteResponse;
const pairs = pairsList.results[0] as BasePairs;

describe('Site Pairs List component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('Should ensure the Process associated renders with correct link href after loading page', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <PairsList site={data} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByText(pairs.destinationName)[0]).toBeInTheDocument();
  });

  it('Should handle the empty case', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <PairsList site={dataNoPairs} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(Labels.NoLinkFound)).toBeInTheDocument();
  });
});
