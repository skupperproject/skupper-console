import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { AvailableProtocols } from '@API/REST.enum';
import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import servicesData from '@mocks/data/SERVICES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import { ConnectionLabels, FlowPairsLabels, RequestLabels } from '../Services.enum';
import Service from '../views/Service';

const servicesResults = servicesData.results;

describe('Begin testing the FlowPairs component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    jest.spyOn(router, 'useParams').mockReturnValue({
      service: `${servicesResults[2].name}@${servicesResults[2].identity}@${AvailableProtocols.Tcp}`
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

  it('should render the TCP Service view after the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(FlowPairsLabels.Overview)).toBeInTheDocument();
    expect(screen.getByText(`${FlowPairsLabels.Servers}`)).toBeInTheDocument();
    expect(screen.getByText(`${ConnectionLabels.ActiveConnections}`)).toBeInTheDocument();
    expect(screen.getByText(`${ConnectionLabels.OldConnections}`)).toBeInTheDocument();
  });

  it('should render the HTTP/2 Service view after the data loading is complete', async () => {
    jest.spyOn(router, 'useParams').mockReturnValue({
      service: `${servicesResults[0].name}@${servicesResults[0].identity}@${AvailableProtocols.Http2}`
    });

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(FlowPairsLabels.Overview)).toBeInTheDocument();
    expect(screen.getByText(`${FlowPairsLabels.Servers}`)).toBeInTheDocument();
    expect(screen.getByText(`${RequestLabels.Requests}`)).toBeInTheDocument();
  });

  it('should clicking on a tab will result in the server tab being highlighted', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    fireEvent.click(screen.getByText(FlowPairsLabels.Servers));

    expect(screen.getByText(`${FlowPairsLabels.Servers}`).parentNode?.parentNode).toHaveClass(
      'pf-v5-c-tabs__item pf-m-current'
    );
  });
});
