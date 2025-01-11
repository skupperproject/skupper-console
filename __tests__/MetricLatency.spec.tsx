import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '../mocks/data/PROCESSES.json';
import { loadMockServer } from '../mocks/server';
import { extendedProcessResponse } from '../mocks/server.API';
import * as PrometheusAPIModule from '../src/API/Prometheus.api';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import Latency from '../src/pages/shared/Metrics/components/Latency';
import { Providers } from '../src/providers';

const processResult = processesData.results[0] as extendedProcessResponse;

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
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Latency
            title={Labels.LatencyIn}
            selectedFilters={{
              sourceProcess: processResult.name
            }}
            openSections={true}
            forceUpdate={1}
            onGetIsSectionExpanded={handleGetisSectionExpanded}
          />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(Labels.LatencyIn)).toBeInTheDocument();

    const latencyButton = screen.getByLabelText(Labels.LatencyIn)?.querySelector('button');

    if (latencyButton) {
      fireEvent.click(latencyButton);
    }

    expect(handleGetisSectionExpanded).toHaveBeenCalledTimes(1);
  });

  it('should render the Latency section and display the no metric found message', async () => {
    jest
      .spyOn(PrometheusAPIModule.PrometheusApi, 'fetchPercentilesByLeInTimeRange')
      .mockImplementation(jest.fn().mockReturnValue({ data: null }));

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Latency
            selectedFilters={{
              sourceProcess: processResult.name
            }}
            openSections={true}
          />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(Labels.NoMetricFound)).toBeInTheDocument();
    expect(screen.getByText(Labels.NoMetricFoundDescription)).toBeInTheDocument();
  });
});
