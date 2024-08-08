import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { AvailableProtocols } from '@API/REST.enum';
import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import flowPairsData from '@mocks/data/SERVICE_FLOW_PAIRS.json';
import processesData from '@mocks/data/SERVICE_PROCESSES.json';
import servicesData from '@mocks/data/SERVICES.json';
import { loadMockServer } from '@mocks/server';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, TAB_3_KEY } from '@pages/Services/Services.constants';
import ConnectionsByService from '@pages/Services/views/TcpService';
import LoadingPage from '@pages/shared/Loading';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';

const servicesResults = servicesData.results;
const flowPairsResults = flowPairsData.results;
const processResult = processesData.results;

describe('Begin testing the TCP service component', () => {
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
          <ConnectionsByService
            serviceId={servicesResults[2].identity}
            serviceName={servicesResults[2].name}
            protocol={AvailableProtocols.Tcp}
            viewSelected={TAB_0_KEY}
          />
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
          <ConnectionsByService
            serviceId={servicesResults[2].identity}
            serviceName={servicesResults[2].name}
            protocol={AvailableProtocols.Tcp}
            viewSelected={TAB_1_KEY}
          />
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
          <ConnectionsByService
            serviceId={servicesResults[2].identity}
            serviceName={servicesResults[2].name}
            protocol={AvailableProtocols.Tcp}
            viewSelected={TAB_2_KEY}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByText(flowPairsResults[0].forwardFlow.processName)[0]).toBeInTheDocument();
  });

  it('should render the Connection view -> Old Connections after the data loading is complete', async () => {
    const { queryByTestId, getByText, getAllByText } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ConnectionsByService
            serviceId={servicesResults[2].identity}
            serviceName={servicesResults[2].name}
            protocol={AvailableProtocols.Tcp}
            viewSelected={TAB_3_KEY}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(getAllByText(flowPairsResults[0].forwardFlow.processName)[0]).toBeInTheDocument();
    expect(getByText('Closed')).toBeInTheDocument();
  });
});
