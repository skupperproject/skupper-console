import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import { TopologyViews } from '../Topology.enum';
import Topology from '../views/Topology';

describe('Begin testing the Topology component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Topology />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render a loading page when data is loading', () => {
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
  });

  it('should render the Topology view after the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    expect(screen.getByTestId(getTestsIds.topologyView())).toBeInTheDocument();
  });

  it('hould clicking on a tab will result in the Components tab being highlighted', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    fireEvent.click(screen.getByText(TopologyViews.ProcessGroups));

    expect(screen.getByText(TopologyViews.ProcessGroups).parentNode?.parentNode).toHaveClass('pf-m-current');
  });

  it('hould clicking on a tab will result in the Processes tab being highlighted', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    fireEvent.click(screen.getByText(TopologyViews.Processes));

    expect(screen.getByText(TopologyViews.Processes).parentNode?.parentNode).toHaveClass('pf-m-current');
  });
});
