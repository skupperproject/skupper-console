import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import HttpRequests from '@pages/Services/components/HttpRequests';

import flowPairsData from '../../../mocks/data/FLOW_PAIRS.json';
import processesData from '../../../mocks/data/PROCESSES.json';
import servicesData from '../../../mocks/data/SERVICES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY } from '../../../src/pages/Services/Services.constants';
import LoadingPage from '../../../src/pages/shared/Loading';
import { MetricsLabels } from '../../../src/pages/shared/Metrics/Metrics.enum';

const servicesResults = servicesData.results;
const flowPairsResults = flowPairsData.results;
const processResult = processesData.results;

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

  it('should render the Requests view -> Overview after the data loading is complete', async () => {
    const { getByText } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <HttpRequests id={servicesResults[0].identity} name={servicesResults[0].name} viewSelected={TAB_0_KEY} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
    expect(getByText(MetricsLabels.DataTransferTitle)).toBeInTheDocument();
  });

  it('should render the Requests view -> Servers after the data loading is complete', async () => {
    const { getByText } = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <HttpRequests id={servicesResults[0].identity} name={servicesResults[0].name} viewSelected={TAB_1_KEY} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
    expect(getByText(processResult[0].name)).toBeInTheDocument();
  });

  it('should render the Requests view -> Requests after the data loading is complete', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <HttpRequests id={servicesResults[0].identity} name={servicesResults[0].name} viewSelected={TAB_2_KEY} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByText(flowPairsResults[0].sourceProcessName)[0]).toBeInTheDocument();
  });
});
