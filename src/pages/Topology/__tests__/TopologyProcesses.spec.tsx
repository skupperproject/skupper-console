import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import servicesData from '@mocks/data/SERVICES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import TopologyProcesses from '../components/TopologyProcesses';
import { TopologyLabels } from '../Topology.enum';

const servicesResults = servicesData.results;

jest.mock('@antv/g6');

describe('Begin testing the Topology component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologyProcesses serviceId={'process-2:3000'} id={'process-2-xy'} />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Topology view after the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    expect(screen.getByTestId('sk-topology-processes')).toBeInTheDocument();
  });

  it('should clicking on the service menu', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    fireEvent.click(screen.getByText(servicesResults[0].name));
    expect(screen.getByRole('service-select')).toBeInTheDocument();

    fireEvent.click(screen.getAllByText(servicesResults[0].name)[0]);
    expect(screen.queryByText('service-select')).not.toBeInTheDocument();
  });

  it('should clicking on the display menu', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    fireEvent.click(screen.getByText(TopologyLabels.DisplayPlaceholderText));
    expect(screen.getByRole('display-select')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Site'));
  });
});
