import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import pairsList from '../mocks/data/COMPONENT_PAIRS.json';
import components from '../mocks/data/COMPONENTS.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import PairsList from '../src/pages/Components/components/PairList';
import { Providers } from '../src/providers';
import { ComponentResponse, BasePairs } from '../src/types/REST.interfaces';

const data = components.results[0] as ComponentResponse;
const dataNoPairs = {
  endTime: 0,
  identity: 'no-pairs',
  name: 'no-pairs',
  startTime: 1728076321000000
} as ComponentResponse;
const pairs = pairsList.results[5] as BasePairs;

describe('Component Pairs Llist component', () => {
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
          <PairsList component={data} />
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
          <PairsList component={dataNoPairs} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(Labels.NoLinkFound)).toBeInTheDocument();
  });
});
