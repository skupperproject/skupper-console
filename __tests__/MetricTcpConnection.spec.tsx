import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '../mocks/data/PROCESSES.json';
import { loadMockServer } from '../mocks/server';
import * as PrometheusAPIModule from '../src/API/Prometheus.api';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import { Providers } from '../src/providers';
import TcpConnection from '../src/pages/shared/Metrics/components/TcpConnection';
import { Labels } from '../src/config/labels';
import { ProcessResponse } from '../src/types/REST.interfaces';

const processResult = processesData.results[0] as ProcessResponse;

describe('Tcp component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Tcp section of the metric', async () => {
    const handleGetisSectionExpanded = jest.fn();

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnection
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

    expect(screen.getByText(Labels.TcpConnections)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(Labels.TcpConnections)?.querySelector('button')!);
    expect(handleGetisSectionExpanded).toHaveBeenCalledTimes(1);
  });

  it('should not render the Tcp section', async () => {
    jest
      .spyOn(PrometheusAPIModule.PrometheusApi, 'fetchOpenConnections')
      .mockImplementation(jest.fn().mockReturnValue({ data: null }));

    jest
      .spyOn(PrometheusAPIModule.PrometheusApi, 'fetchOpenConnectionsInTimeRange')
      .mockImplementation(jest.fn().mockReturnValue({ data: null }));

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnection
            selectedFilters={{
              sourceProcess: processResult.name
            }}
            openSections={true}
            forceUpdate={1}
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
