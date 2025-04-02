import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import processesData from '../mocks/data/PROCESSES.json';
import { loadMockServer } from '../mocks/server';
import * as PrometheusAPIModule from '../src/API/Prometheus.api';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import Latency from '../src/core/components/Metrics/components/Latency';
import LoadingPage from '../src/core/components/SkLoading';
import { Providers } from '../src/providers';

const processResult = processesData.results[0];

describe('Latency component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('should render the Latency section of the metric', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Latency
            title={Labels.LatencyIn}
            selectedFilters={{
              sourceProcess: processResult.name
            }}
          />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(Labels.LatencyIn)).toBeInTheDocument();
  });

  it('should render the Latency section and display the no metric found message', async () => {
    vi.spyOn(PrometheusAPIModule.PrometheusApi, 'fetchPercentilesByLeHistory').mockImplementation(
      vi.fn().mockReturnValue({ data: null })
    );

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Latency
            selectedFilters={{
              sourceProcess: processResult.name
            }}
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
