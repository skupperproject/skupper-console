import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import TcpConnections from '@pages/Services/components/TcpConnections';

import flowPairsData from '../../../mocks/data/FLOW_PAIRS.json';
import processesData from '../../../mocks/data/PROCESSES.json';
import servicesData from '../../../mocks/data/SERVICES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import { TAB_0_KEY, TAB_1_KEY, TAB_3_KEY, TAB_4_KEY } from '../../../src/pages/Services/Services.constants';
import LoadingPage from '../../../src/pages/shared/Loading';
import { MetricsLabels } from '../../../src/pages/shared/Metrics/Metrics.enum';

const servicesResults = servicesData.results;
const tcpBiFlowOpen = flowPairsData.results[5];
const tcpBiFlowTerminated = flowPairsData.results[6];
const processResult = processesData.results;

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

  it('should render the Connection view -> Overview after the data loading is complete', async () => {
    const { getByText } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnections id={servicesResults[5].identity} name={servicesResults[5].name} viewSelected={TAB_0_KEY} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
    expect(getByText(MetricsLabels.DataTransferTitle)).toBeInTheDocument();
  });

  it('should render the Connection view -> Servers after the data loading is complete', async () => {
    const { getByText } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnections id={servicesResults[2].identity} name={servicesResults[2].name} viewSelected={TAB_1_KEY} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
    expect(getByText(processResult[0].name)).toBeInTheDocument();
  });

  it('should render the Connection view -> Open connections after the data loading is complete', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnections id={servicesResults[4].identity} name={servicesResults[4].name} viewSelected={TAB_3_KEY} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByText(tcpBiFlowOpen.sourceProcessName)[0]).toBeInTheDocument();
  });

  it('should render the Connection view -> Old Connections after the data loading is complete', async () => {
    const { queryByTestId, getByText, getAllByText } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnections id={servicesResults[4].identity} name={servicesResults[4].name} viewSelected={TAB_4_KEY} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(getAllByText(tcpBiFlowTerminated.sourceProcessName)[0]).toBeInTheDocument();
    expect(getByText('Closed')).toBeInTheDocument();
  });
});
