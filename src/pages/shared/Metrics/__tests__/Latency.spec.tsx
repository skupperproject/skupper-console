import { Suspense } from 'react';

import * as ReactQuery from '@tanstack/react-query';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { ProcessResponse } from '@API/REST.interfaces';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import Latency from '../components/Latency';
import { MetricsLabels } from '../Metrics.enum';

const processResult = processesData.results[0] as ProcessResponse;

describe('Latency component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Latency section of the metric', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Latency
            selectedFilters={{
              sourceProcess: processResult.name
            }}
            openSections={true}
            forceUpdate={1}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(MetricsLabels.LatencyTitle)).toBeInTheDocument();
  });

  it('should render the Latency section and display the no metric found message', async () => {
    jest.spyOn(ReactQuery, 'useQuery').mockImplementation(jest.fn().mockReturnValue({ data: null }));

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Latency
            selectedFilters={{
              sourceProcess: processResult.name
            }}
            openSections={true}
          />
        </Suspense>
      </Wrapper>
    );

    expect(screen.getByText(MetricsLabels.NoMetricFoundTitleMessage)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.NoMetricFoundDescriptionMessage)).toBeInTheDocument();
  });
});
