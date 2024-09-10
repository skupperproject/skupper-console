import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '../../../mocks/data/PROCESSES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import LoadingPage from '../../../src/pages/shared/Loading';
import Traffic from '../../../src/pages/shared/Metrics/components/Traffic';
import { MetricsLabels } from '../../../src/pages/shared/Metrics/Metrics.enum';
import * as MetricsModule from '../../../src/pages/shared/Metrics/services/index';
import { ProcessResponse } from '../../../src/types/REST.interfaces';

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

    render(
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
