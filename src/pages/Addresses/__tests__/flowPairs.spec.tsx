import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import flowPairsData from '@mocks/data/SERVICE_FLOW_PAIRS.json';
import servicesData from '@mocks/data/SERVICES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import { FlowPairsLabels, RequestLabels } from '../Addresses.enum';
import Service from '../views/FlowPairs';

const servicesResults = servicesData.results;
const flowPairsResults = flowPairsData.results;

describe('Begin testing the App component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    // Mock URL query parameters and inject them into the component
    jest.spyOn(router, 'useParams').mockReturnValue({
      id: `${servicesResults[0].name}@${servicesResults[0].identity}}@${servicesResults[0].protocol}`
    });
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Service />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the HTTP/2 Service view after the data loading is complete', async () => {
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(FlowPairsLabels.Overview)).toBeInTheDocument();
    expect(screen.getByText(`${FlowPairsLabels.Servers} (${servicesResults.length})`)).toBeInTheDocument();
    expect(screen.getByText(`${RequestLabels.Requests} (${flowPairsResults.length})`)).toBeInTheDocument();

    fireEvent.click(screen.getByText(`${FlowPairsLabels.Servers} (${servicesResults.length})`));

    expect(
      screen.getByText(`${FlowPairsLabels.Servers} (${servicesResults.length})`).parentNode?.parentNode
    ).toHaveClass('pf-v5-c-tabs__item pf-m-current');
  });
});
