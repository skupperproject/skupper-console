import { Suspense } from 'react';

import { render, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import servicesData from '../mocks/data/SERVICES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import TcpTerminatedConnections from '../src/pages/Services/components/TcpTerminatedConnections';
import { Providers } from '../src/providers';

const servicesResults = servicesData.results;

describe('Begin testing the TCP connections component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Connection view -> Old Connections after the data loading is complete', async () => {
    const { queryByTestId, getByText } = render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TcpTerminatedConnections routingKey={servicesResults[1].name} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(getByText('Closed')).toBeInTheDocument();
  });
});
