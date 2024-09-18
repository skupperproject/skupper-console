import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import TcpConnections from '@pages/Services/components/TcpConnections';

import biFlowData from '../../../mocks/data/FLOW_PAIRS.json';
import servicesData from '../../../mocks/data/SERVICES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import LoadingPage from '../../../src/pages/shared/Loading';

const servicesResults = servicesData.results;
const tcpBiFlowOpen = biFlowData.results[5];

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
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnections id={servicesResults[4].identity} name={servicesResults[4].name} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByText(tcpBiFlowOpen.sourceProcessName)[0]).toBeInTheDocument();
  });
});
