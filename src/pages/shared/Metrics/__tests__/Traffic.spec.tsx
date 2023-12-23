import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import * as PrometheusAPIModule from '@API/Prometheus.api';
import { ProcessResponse } from '@API/REST.interfaces';
import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import Traffic from '../components/Traffic';
import { MetricsLabels } from '../Metrics.enum';

let component;
const processResult = processesData.results[0] as ProcessResponse;

describe('Traffic component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Traffic section of the metric', async () => {
    const handleGetisSectionExpanded = jest.fn();

    component = render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Traffic
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

    expect(screen.getByText(MetricsLabels.DataTransferTitle)).toBeInTheDocument();

    fireEvent.click(document.querySelector('.pf-v5-c-card__header-toggle')?.querySelector('button')!);
    expect(handleGetisSectionExpanded).toHaveBeenCalledTimes(1);

    expect(component).toMatchSnapshot();
  });

  it('should render the Traffic section and display the no metric found message', async () => {
    jest
      .spyOn(PrometheusAPIModule.PrometheusApi, 'fetchByteRateByDirectionInTimeRange')
      .mockImplementation(jest.fn().mockReturnValue({ data: null }));

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Traffic
            selectedFilters={{
              sourceProcess: processResult.name
            }}
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
