import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { AvailableProtocols } from '@API/REST.enum';
import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import servicesData from '@mocks/data/SERVICES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import { ServicesLabels } from '../Services.enum';
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
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(ServicesLabels.Overview)).toBeInTheDocument();
    expect(screen.getByText(`${ServicesLabels.Servers}`)).toBeInTheDocument();
    expect(screen.getByText(`${ServicesLabels.ActiveConnections}`)).toBeInTheDocument();
    expect(screen.getByText(`${ServicesLabels.OldConnections}`)).toBeInTheDocument();
  });

  it('should render the HTTP/2 Service view after the data loading is complete', async () => {
    jest.spyOn(router, 'useParams').mockReturnValue({
      service: `${servicesResults[0].name}@${servicesResults[0].identity}@${AvailableProtocols.Http2}`
    });

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(ServicesLabels.Overview)).toBeInTheDocument();
    expect(screen.getByText(`${ServicesLabels.Servers}`)).toBeInTheDocument();
    expect(screen.getByText(`${ServicesLabels.Requests}`)).toBeInTheDocument();
  });

  it('should clicking on a tab will result in the server tab being highlighted', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(ServicesLabels.Servers));

    expect(screen.getByText(`${ServicesLabels.Servers}`).parentNode?.parentNode).toHaveClass(
      'pf-v5-c-tabs__item pf-m-current'
    );
  });
});
