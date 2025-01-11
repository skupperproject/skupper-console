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
import Response from '../src/pages/shared/Metrics/components/Response';
import { Providers } from '../src/providers';

const processResult = processesData.results[0] as extendedProcessResponse;

describe('Response component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Reponse section of the metric', async () => {
    const handleGetisSectionExpanded = jest.fn();

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Response
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

    expect(screen.getByText(Labels.Responses)).toBeInTheDocument();

    const responseLabel = screen.getByLabelText(Labels.Responses);

    if (responseLabel) {
      const button = responseLabel.querySelector('button');
      if (button) {
        fireEvent.click(button);
      }
    }

    expect(handleGetisSectionExpanded).toHaveBeenCalledTimes(1);
  });

  it('should not render the Response section', async () => {
    jest
      .spyOn(PrometheusAPIModule.PrometheusApi, 'fetchResponseCountsByPartialCodeInTimeRange')
      .mockImplementation(jest.fn().mockReturnValue({ data: null }));

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Response
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
