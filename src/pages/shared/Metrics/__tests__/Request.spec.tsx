import { Suspense } from 'react';

import * as ReactQuery from '@tanstack/react-query';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { ProcessResponse } from '@API/REST.interfaces';
import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import Request from '../components/Request';
import { MetricsLabels } from '../Metrics.enum';

let component;
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
    component = render(
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

    expect(screen.getByText(MetricsLabels.RequestsTitle)).toBeInTheDocument();
    expect(component).toMatchSnapshot();
  });

  it('should render the Request section and display the no metric found message', async () => {
    jest.spyOn(ReactQuery, 'useQueries').mockImplementation(
      jest.fn().mockReturnValue([
        { data: null, refetch: null },
        { data: null, refetch: null }
      ])
    );

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Request
            selectedFilters={{
              sourceProcess: processResult.name
            }}
            openSections={true}
          />
        </Suspense>
      </Wrapper>
    );

    expect(screen.getAllByText(MetricsLabels.NoMetricFoundTitleMessage)[0]).toBeInTheDocument();
    expect(screen.getAllByText(MetricsLabels.NoMetricFoundDescriptionMessage)[0]).toBeInTheDocument();

    expect(screen.getAllByText(MetricsLabels.NoMetricFoundTitleMessage)[1]).toBeInTheDocument();
    expect(screen.getAllByText(MetricsLabels.NoMetricFoundDescriptionMessage)[1]).toBeInTheDocument();
  });
});
