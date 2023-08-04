import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { AvailableProtocols } from '@API/REST.enum';
import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import flowPairsData from '@mocks/data/SERVICE_FLOW_PAIRS.json';
import processesData from '@mocks/data/SERVICE_PROCESSES.json';
import servicesData from '@mocks/data/SERVICES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';

import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, TAB_3_KEY } from '../Addresses.constants';
import ConnectionsByAddress from '../components/ConnectionsByAddress';

const servicesResults = servicesData.results;
const flowPairsResults = flowPairsData.results;
const processResult = processesData.results;

jest.mock('@patternfly/react-charts');

describe('Begin testing the Connection component', () => {
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
          <ConnectionsByAddress
            addressId={servicesResults[2].identity}
            addressName={servicesResults[2].name}
            protocol={AvailableProtocols.Tcp}
            viewSelected={TAB_0_KEY}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    expect(getByText(MetricsLabels.DataTransferTitle)).toBeInTheDocument();
  });

  it('should render the Connection view -> Servers after the data loading is complete', async () => {
    const { getByText } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ConnectionsByAddress
            addressId={servicesResults[2].identity}
            addressName={servicesResults[2].name}
            protocol={AvailableProtocols.Tcp}
            viewSelected={TAB_1_KEY}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    expect(getByText(processResult[0].name)).toBeInTheDocument();
  });

  it('should render the Connection view -> Live connections after the data loading is complete', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ConnectionsByAddress
            addressId={servicesResults[2].identity}
            addressName={servicesResults[2].name}
            protocol={AvailableProtocols.Tcp}
            viewSelected={TAB_2_KEY}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getAllByText(flowPairsResults[0].forwardFlow.processName)[0]).toBeInTheDocument();
  });

  it('should render the Connection view -> Old Connections after the data loading is complete', async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <ConnectionsByAddress
            addressId={servicesResults[2].identity}
            addressName={servicesResults[2].name}
            protocol={AvailableProtocols.Tcp}
            viewSelected={TAB_3_KEY}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => getByTestId(getTestsIds.loadingView()));

    expect(getAllByText(flowPairsResults[0].forwardFlow.processName)[0]).toBeInTheDocument();
    expect(getByText('Closed')).toBeInTheDocument();
  });
});
