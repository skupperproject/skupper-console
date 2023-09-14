import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import TopologyProcesses from '../components/TopologyProcesses';

jest.mock('@antv/g6');

describe('Begin testing the Topology component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologyProcesses serviceId={'process-2:3000'} id={'process-2-xy'} />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Topology view after the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    expect(screen.getByTestId('sk-topology-processes')).toBeInTheDocument();
  });
});
