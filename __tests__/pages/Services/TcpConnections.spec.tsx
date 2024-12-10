import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';


import tcpConnections from '../../../mocks/data/TCP_CONNECTIONS.json';
import servicesData from '../../../mocks/data/SERVICES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/app';
import { getTestsIds } from '../../../src/config/testIds';
import LoadingPage from '../../../src/core/components/SkLoading';
import { Providers } from '../../../src/providers';
import TcpConnections from '../../../src/pages/Services/components/TcpConnections';

const servicesResults = servicesData.results;
const tcpConnectionOpen = tcpConnections.results[0];

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

  it('should render the Connection view -> Open connections after the data loading is complete', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnections routingKey={servicesResults[6].name} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByText(tcpConnectionOpen.sourceSiteName)[0]).toBeInTheDocument();
  });
});
