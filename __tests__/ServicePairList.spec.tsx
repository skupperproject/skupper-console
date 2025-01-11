import { Suspense } from 'react';

import { render, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import pairs from '../mocks/data/PROCESS_PAIRS.json';
import servicesData from '../mocks/data/SERVICES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import PairsList from '../src/pages/Services/components/PairsList';
import { Providers } from '../src/providers';

const servicesResults = servicesData.results;
const pairsResults = pairs.results;

describe('Begin testing the Http requests component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Requests view -> Requests after the data loading is complete', async () => {
    const { getAllByTestId, queryByTestId } = render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <PairsList id={servicesResults[0].identity} name={servicesResults[0].name} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(getAllByTestId(pairsResults[7].sourceName)[0]).toBeInTheDocument();
  });
});
