import { Suspense } from 'react';

import { render, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import httpRequests from '../mocks/data/HTTP_REQUESTS.json';
import servicesData from '../mocks/data/SERVICES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import HttpRequests from '../src/pages/Services/components/HttpRequests';
import { Providers } from '../src/providers';

const servicesResults = servicesData.results;
const httpRequestResults = httpRequests.results;

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
          <HttpRequests routingKey={servicesResults[1].name} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(getAllByTestId(httpRequestResults[0].sourceProcessName)[0]).toBeInTheDocument();
  });
});
