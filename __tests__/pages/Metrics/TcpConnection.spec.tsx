import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '../../../mocks/data/PROCESSES.json';
import { loadMockServer } from '../../../mocks/server';
import * as PrometheusAPIModule from '../../../src/API/Prometheus.api';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import LoadingPage from '../../../src/pages/shared/Loading';
import TcpConnection from '../../../src/pages/shared/Metrics/components/TcpConnection';
import { MetricsLabels } from '../../../src/pages/shared/Metrics/Metrics.enum';
import { ProcessResponse } from '../../../src/types/REST.interfaces';

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
      <Wrapper>
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
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(MetricsLabels.ConnectionTitle)).toBeInTheDocument();

    fireEvent.click(document.querySelector('.pf-v5-c-card__header-toggle')?.querySelector('button')!);
    expect(handleGetisSectionExpanded).toHaveBeenCalledTimes(1);
  });

  it('should not render the Tcp section', async () => {
    jest
      .spyOn(PrometheusAPIModule.PrometheusApi, 'fetchLiveFlows')
      .mockImplementation(jest.fn().mockReturnValue({ data: null }));

    jest
      .spyOn(PrometheusAPIModule.PrometheusApi, 'fetchFlowsDeltaInTimeRange')
      .mockImplementation(jest.fn().mockReturnValue({ data: null }));

    jest
      .spyOn(PrometheusAPIModule.PrometheusApi, 'fetchtotalFlows')
      .mockImplementation(jest.fn().mockReturnValue({ data: null }));

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TcpConnection
            selectedFilters={{
              sourceProcess: processResult.name
            }}
            openSections={true}
            forceUpdate={1}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    //expect(screen.queryByText(MetricsLabels.ResposeTitle)).not.toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.NoMetricFoundTitleMessage)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.NoMetricFoundDescriptionMessage)).toBeInTheDocument();
  });
});
