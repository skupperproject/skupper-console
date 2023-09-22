import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { ProcessResponse } from '@API/REST.interfaces';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import Metrics from '../index';
import { MetricsLabels } from '../Metrics.enum';

const processResult = processesData.results[0] as ProcessResponse;

describe('Metrics component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Metrics with all sections opened', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Metrics
            selectedFilters={{ processIdSource: processResult.identity }}
            openSections={{ latency: true, request: true, response: true }}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(MetricsLabels.DataTransferTitle)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.HttpStatus)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.RequestsTitle)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.HttpStatus)).toBeInTheDocument();
  });
});
