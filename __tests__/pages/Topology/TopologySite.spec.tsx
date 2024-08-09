import { Suspense, memo, forwardRef, useImperativeHandle, FC } from 'react';

import { Button } from '@patternfly/react-core';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import eventUser from '@testing-library/user-event';
import { Server } from 'miragejs';

import sitesData from '../../../mocks/data/SITES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import LoadingPage from '../../../src/pages/shared/Loading';
import TopologySite from '../../../src/pages/Topology/components/TopologySite';
import { TopologyController } from '../../../src/pages/Topology/services';
import { SHOW_DATA_LINKS } from '../../../src/pages/Topology/Topology.constants';
import { SkGraphProps } from '../../../src/types/Graph.interfaces';

const sitesResults = sitesData.results;

const MockGraphComponent: FC<SkGraphProps> = memo(
  forwardRef(({ onClickEdge, onClickNode }, ref) => {
    useImperativeHandle(ref, () => ({
      saveNodePositions() {
        return jest.fn();
      }
    }));

    return (
      <>
        <Button onClick={() => onClickNode && onClickNode(sitesResults[0].identity)}>onClickNode</Button>
        <Button
          onClick={() => onClickEdge && onClickEdge(`${sitesResults[2].identity}-to-${sitesResults[1].identity}`)}
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
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologySite
            ids={TopologyController.transformStringIdsToIds(sitesResults[2].identity)}
            GraphComponent={MockGraphComponent}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText('onClickNode'));
  });

  it('should clicking on a node', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologySite
            ids={TopologyController.transformStringIdsToIds(sitesResults[2].identity)}
            GraphComponent={MockGraphComponent}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText('onClickNode'));
  });

  it('should clicking on a edge', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologySite
            ids={TopologyController.transformStringIdsToIds(sitesResults[2].identity)}
            GraphComponent={MockGraphComponent}
          />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText('onClickEdge'));
  });

  it('should render data links', async () => {
    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologySite GraphComponent={MockGraphComponent} initDisplayOptionsEnabled={[SHOW_DATA_LINKS]} />
        </Suspense>
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
  });
});
