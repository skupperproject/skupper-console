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
import LoadingPage from '../src/core/components/SkLoading';
import TcpConnection from '../src/pages/shared/Metrics/components/TcpConnection';
import { Providers } from '../src/providers';

const processResult = processesData.results[0];

describe('Tcp component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('should render the Tcp section of the metric', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnection
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

    expect(screen.getByText(Labels.TcpConnections)).toBeInTheDocument();
  });

  it('should not render the Tcp section', async () => {
    vi.spyOn(PrometheusAPIModule.PrometheusApi, 'fetchInstantOpenConnections').mockImplementation(
      vi.fn().mockReturnValue({ data: null })
    );

    vi.spyOn(PrometheusAPIModule.PrometheusApi, 'fetchOpenConnectionsHistory').mockImplementation(
      vi.fn().mockReturnValue({ data: null })
    );

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnection
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
