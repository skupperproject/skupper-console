import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { ProcessPairsResponse, SitePairsResponse } from '@API/REST.interfaces';
import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import processPairsData from '@mocks/data/PROCESS_PAIRS.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import ProcessPairs from '../views/ProcessPair';

const processPairsResult = processPairsData.results[0] as ProcessPairsResponse | SitePairsResponse;

describe('Begin testing the Processes component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    jest.spyOn(router, 'useParams').mockReturnValue({ processPair: `${'test'}@${processPairsResult.identity}` });

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ProcessPairs />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render a loading page when data is loading', () => {
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
  });

  it('should render the ProcessPairs view after the data loading is complete', async () => {
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
    expect(screen.getByTestId(getTestsIds.processPairsView(processPairsResult.identity))).toBeInTheDocument();
  });
});
