import { Suspense, memo, forwardRef, useImperativeHandle, FC } from 'react';

import { Button } from '@patternfly/react-core';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import eventUser from '@testing-library/user-event';
import { Server } from 'miragejs';

import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import { Wrapper } from '@core/components/Wrapper';
import sitesData from '@mocks/data/SITES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import TopologySite from '../components/TopologySite';
import * as useTopologySiteState from '../components/useTopologyState';
import { TopologyController } from '../services';
import { TopologyLabels } from '../Topology.enum';

const sitesResults = sitesData.results;

const MockGraphComponent: FC<GraphReactAdaptorProps> = memo(
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

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologySite
            id={TopologyController.transformStringIdsToIds(sitesResults[2].identity)}
            GraphComponent={MockGraphComponent}
          />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.restoreAllMocks();
  });

  it('should clicking on a node', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText('onClickNode'));
  });

  it('should clicking on a edge', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText('onClickEdge'));
  });

  it('should save node positions and display info alert when handleSaveTopology is called', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText(TopologyLabels.SaveButton));

    expect(screen.getByText(TopologyLabels.ToastSave)).toBeInTheDocument();
  });

  it('should select a Site from the toolbar', async () => {
    const handleSelected = jest.fn();

    jest.spyOn(useTopologySiteState, 'default').mockImplementation(() => ({
      idSelected: TopologyController.transformStringIdsToIds(sitesResults[2].identity),
      showOnlyNeighbours: false,
      moveToNodeSelected: false,
      displayOptionsSelected: [],
      handleSelected,
      getDisplaySelectedFromLocalStorage: jest.fn(),
      handleShowOnlyNeighbours: jest.fn(),
      handleMoveToNodeSelectedChecked: jest.fn(),
      handleDisplaySelected: jest.fn()
    }));

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByDisplayValue(`${sitesResults[2].name} (${sitesResults[2].siteVersion})`));
    await eventUser.click(screen.getByText(`${sitesResults[3].name} (${sitesResults[3].siteVersion})`));

    expect(handleSelected).toHaveBeenCalled();
  });

  it('should update showOnlyNeighbours state on checkbox click', async () => {
    const handleShowOnlyNeighbours = jest.fn();

    jest.spyOn(useTopologySiteState, 'default').mockImplementation(() => ({
      idSelected: TopologyController.transformStringIdsToIds(sitesResults[2].identity),
      showOnlyNeighbours: false,
      moveToNodeSelected: false,
      displayOptionsSelected: [],
      handleSelected: jest.fn(),
      getDisplaySelectedFromLocalStorage: jest.fn(),
      handleShowOnlyNeighbours,
      handleMoveToNodeSelectedChecked: jest.fn(),
      handleDisplaySelected: jest.fn()
    }));

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const checkbox = screen
      .getByTestId('show-only-neighbours-checkbox')
      .querySelector('input[type="checkbox') as HTMLInputElement;

    await eventUser.click(checkbox);

    expect(handleShowOnlyNeighbours).toHaveBeenCalled();
  });

  it('should update moveToNodeSelected state on checkbox click', async () => {
    const handleMoveToNodeSelectedChecked = jest.fn();

    jest.spyOn(useTopologySiteState, 'default').mockImplementation(() => ({
      idSelected: TopologyController.transformStringIdsToIds(sitesResults[2].identity),
      showOnlyNeighbours: false,
      moveToNodeSelected: false,
      displayOptionsSelected: [],
      handleSelected: jest.fn(),
      getDisplaySelectedFromLocalStorage: jest.fn(),
      handleShowOnlyNeighbours: jest.fn(),
      handleMoveToNodeSelectedChecked,
      handleDisplaySelected: jest.fn()
    }));

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const checkbox = screen
      .getByTestId('move-to-node-selected-checkbox')
      .querySelector('input[type="checkbox') as HTMLInputElement;

    await eventUser.click(checkbox);
    expect(handleMoveToNodeSelectedChecked).toHaveBeenCalled();
  });
});
