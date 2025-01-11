import { Suspense, memo, forwardRef, useImperativeHandle, FC } from 'react';

import { Button } from '@patternfly/react-core';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import eventUser from '@testing-library/user-event';
import { Server } from 'miragejs';

import sitePairsData from '../mocks/data/SITE_PAIRS.json';
import sitesData from '../mocks/data/SITES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import TopologySite from '../src/pages/Topology/components/TopologySite';
import { TopologyController } from '../src/pages/Topology/services';
import { convertSiteToNode } from '../src/pages/Topology/services/topologySiteController';
import { SHOW_DATA_LINKS } from '../src/pages/Topology/Topology.constants';
import { Providers } from '../src/providers';
import { SkGraphProps } from '../src/types/Graph.interfaces';
import { PairsResponse, SiteResponse } from '../src/types/REST.interfaces';

const sitesResults = sitesData.results as SiteResponse[];
const sitePairsResults = sitePairsData.results as PairsResponse[];

const MockGraphComponent: FC<SkGraphProps> = memo(
  forwardRef(({ onClickEdge, onClickNode }, ref) => {
    useImperativeHandle(ref, () => ({
      saveNodePositions() {
        return jest.fn();
      }
    }));

    return (
      <>
        <Button onClick={() => onClickNode && onClickNode(convertSiteToNode(sitesResults[0]))}>onClickNode</Button>
        <Button
          onClick={() =>
            onClickEdge && onClickEdge(TopologyController.convertPairToEdge(sitePairsResults[0], 'SkDataEdge'))
          }
        >
          onClickEdge
        </Button>
      </>
    );
  })
);

describe('TopologySite', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.restoreAllMocks();
  });

  it('should display with idSelected', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TopologySite
            ids={TopologyController.transformStringIdsToIds(sitesResults[2].identity)}
            GraphComponent={MockGraphComponent}
          />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText('onClickNode'));
  });

  it('should clicking on a node', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TopologySite
            ids={TopologyController.transformStringIdsToIds(sitesResults[2].identity)}
            GraphComponent={MockGraphComponent}
          />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText('onClickNode'));
  });

  it('should clicking on a edge', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TopologySite
            ids={TopologyController.transformStringIdsToIds(sitesResults[2].identity)}
            GraphComponent={MockGraphComponent}
          />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText('onClickEdge'));
  });

  it('should render data links', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TopologySite GraphComponent={MockGraphComponent} initDisplayOptionsEnabled={[SHOW_DATA_LINKS]} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
  });
});
