import { Suspense } from 'react';

import * as ReactQuery from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import { ProcessResponse } from '@API/REST.interfaces';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import Metrics from '..';
import { MetricsLabels } from '../Metrics.enum';

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
    jest.spyOn(ReactQuery, 'useQuery').mockImplementation(jest.fn().mockReturnValue({ data: null }));

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Metrics
            selectedFilters={{
              processIdSource: processResult.name
            }}
          />
        </Suspense>
      </Wrapper>
    );

    expect(screen.getByText(MetricsLabels.NoMetricFoundTitleMessage)).toBeInTheDocument();
    expect(screen.getByText(MetricsLabels.NoMetricFoundDescriptionMessage)).toBeInTheDocument();
  });
});
