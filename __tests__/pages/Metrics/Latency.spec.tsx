import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '../../../mocks/data/PROCESSES.json';
import { loadMockServer } from '../../../mocks/server';
import * as PrometheusAPIModule from '../../../src/API/Prometheus.api';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/app';
import { getTestsIds } from '../../../src/config/testIds';
import LoadingPage from '../../../src/core/components/SkLoading';
import { Wrapper } from '../../../src/core/components/Wrapper';
import Latency from '../../../src/pages/shared/Metrics/components/Latency';
import { MetricsLabels } from '../../../src/pages/shared/Metrics/Metrics.enum';
import { ProcessResponse } from '../../../src/types/REST.interfaces';

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
    const handleGetisSectionExpanded = jest.fn();

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Latency
            title={MetricsLabels.LatencyTitleOut}
            selectedFilters={{
              sourceProcess: processResult.name
            }}
            openSections={true}
            forceUpdate={1}
            onGetIsSectionExpanded={handleGetisSectionExpanded}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(MetricsLabels.LatencyTitleOut)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(MetricsLabels.LatencyTitleOut)?.querySelector('button')!);
    expect(handleGetisSectionExpanded).toHaveBeenCalledTimes(1);
  });

  it('should render the Latency section and display the no metric found message', async () => {
    jest
      .spyOn(PrometheusAPIModule.PrometheusApi, 'fetchPercentilesByLeInTimeRange')
      .mockImplementation(jest.fn().mockReturnValue({ data: null }));

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

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(MetricsLabels.NoMetricFoundTitleMessage)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.NoMetricFoundDescriptionMessage)).toBeInTheDocument();
  });
});
