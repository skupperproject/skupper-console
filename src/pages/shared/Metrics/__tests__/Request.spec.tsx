import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { ProcessResponse } from '@API/REST.interfaces';
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

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(MetricsLabels.RequestsTitle)).toBeInTheDocument();
    expect(component).toMatchSnapshot();
  });
});
