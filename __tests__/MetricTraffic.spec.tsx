import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import processesData from '../mocks/data/PROCESSES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import Traffic from '../src/core/components/Metrics/components/Traffic';
import * as MetricsModule from '../src/core/components/Metrics/services/index';
import LoadingPage from '../src/core/components/SkLoading';
import { Providers } from '../src/providers';

const processResult = processesData.results[0];

describe('Traffic component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('should render the Traffic section of the metric', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Traffic
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

    expect(screen.getByText(Labels.TcpTraffic)).toBeInTheDocument();
  });

  it('should render the Traffic section and display the no metric found message', async () => {
    vi.spyOn(MetricsModule.MetricsController, 'getDataTraffic').mockImplementation(
      vi.fn().mockReturnValue({
        traffic: [],
        trafficClient: [],
        trafficServer: []
      })
    );

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Traffic
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
