import { Suspense } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import { loadMockServer } from '../mocks/server';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import { TopologyViews } from '../src/pages/Topology/Topology.enum';
import Topology from '../src/pages/Topology/views/Topology';
import { Providers } from '../src/providers';

jest.mock('@antv/g6');

describe('Begin testing the Topology component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Topology />
        </Suspense>
      </Providers>
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
    expect(screen.getByTestId(getTestsIds.topologyView())).toBeInTheDocument();
  });

  it('should clicking on a tab will result in the Components tab being highlighted', async () => {
    fireEvent.click(screen.getByText(TopologyViews.Components));

    expect(screen.getByText(TopologyViews.Components).parentNode?.parentNode).toHaveClass('pf-m-current');
  });

  it('should clicking on a tab will result in the Processes tab being highlighted', async () => {
    fireEvent.click(screen.getByText(TopologyViews.Processes));

    expect(screen.getByText(TopologyViews.Processes).parentNode?.parentNode).toHaveClass('pf-m-current');
  });
});
