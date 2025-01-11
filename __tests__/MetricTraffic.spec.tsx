import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '../mocks/data/PROCESSES.json';
import { loadMockServer } from '../mocks/server';
import { extendedProcessResponse } from '../mocks/server.API';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import Traffic from '../src/pages/shared/Metrics/components/Traffic';
import * as MetricsModule from '../src/pages/shared/Metrics/services/index';
import { Providers } from '../src/providers';

const processResult = processesData.results[0] as extendedProcessResponse;

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

    render(
      <Providers>
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
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(Labels.TcpTraffic)).toBeInTheDocument();

    const button = screen.getByLabelText(Labels.TcpTraffic)?.querySelector('button');

    if (button) {
      fireEvent.click(button);
    }

    expect(handleGetisSectionExpanded).toHaveBeenCalledTimes(1);
  });

  it('should render the Traffic section and display the no metric found message', async () => {
    jest.spyOn(MetricsModule.MetricsController, 'getDataTraffic').mockImplementation(
      jest.fn().mockReturnValue({
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
