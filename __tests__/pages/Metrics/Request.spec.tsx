import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '../../../mocks/data/PROCESSES.json';
import { loadMockServer } from '../../../mocks/server';
import * as PrometheusAPIModule from '../../../src/API/Prometheus.api';
import { PATTERNFLY_VERSION, waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import LoadingPage from '../../../src/core/components/SkLoading';
import { Wrapper } from '../../../src/core/components/Wrapper';
import Request from '../../../src/pages/shared/Metrics/components/Request';
import { MetricsLabels } from '../../../src/pages/shared/Metrics/Metrics.enum';
import { ProcessResponse } from '../../../src/types/REST.interfaces';

const processResult = processesData.results[0] as ProcessResponse;

describe('Request component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Request section of the metric', async () => {
    const handleGetisSectionExpanded = jest.fn();

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Request
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

    expect(screen.getByText(MetricsLabels.RequestsTitle)).toBeInTheDocument();

    fireEvent.click(
      document.querySelector(`.pf-${PATTERNFLY_VERSION}-c-card__header-toggle`)?.querySelector('button')!
    );
    expect(handleGetisSectionExpanded).toHaveBeenCalledTimes(1);
  });

  it('should not render the Request section', async () => {
    jest
      .spyOn(PrometheusAPIModule.PrometheusApi, 'fetchRequestRateByMethodInInTimeRange')
      .mockImplementation(jest.fn().mockReturnValue({ data: null }));

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Request
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

    // expect(screen.queryByText(MetricsLabels.RequestsTitle)).not.toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.NoMetricFoundTitleMessage)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.NoMetricFoundDescriptionMessage)).toBeInTheDocument();
  });
});
