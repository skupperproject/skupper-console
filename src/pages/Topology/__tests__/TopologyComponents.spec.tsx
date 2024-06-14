import { Suspense, memo, forwardRef, useImperativeHandle, FC } from 'react';

import { Button } from '@patternfly/react-core';
import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import eventUser from '@testing-library/user-event';
import { Server } from 'miragejs';

import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import { Wrapper } from '@core/components/Wrapper';
import componentData from '@mocks/data/PROCESS_GROUPS.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import TopologyComponent from '../components/TopologyComponent';
import * as useTopologySiteState from '../components/useTopologyState';
import { TopologyController } from '../services';
import { TopologyLabels } from '../Topology.enum';

const componentResult = componentData.results;

const MockGraphComponent: FC<GraphReactAdaptorProps> = memo(
  forwardRef(({ onClickEdge, onClickNode, onClickCombo }, ref) => {
    useImperativeHandle(ref, () => ({
      saveNodePositions() {
        return jest.fn();
      }
    }));

    return (
      <>
        <Button onClick={() => onClickNode && onClickNode(componentResult[0].identity)}>onClickNode</Button>
        <Button
          onClick={() => onClickEdge && onClickEdge(`${componentResult[2].identity}-to-${componentResult[1].identity}`)}
        >
          onClickEdge
        </Button>
        <Button onClick={() => onClickCombo && onClickCombo({ id: 'combo', label: 'combo' })}>onClickCombo</Button>
      </>
    );
  })
);

describe('Topology Components', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologyComponent
            ids={TopologyController.transformStringIdsToIds(componentResult[2].name)}
            GraphComponent={MockGraphComponent}
          />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should clicking on a node', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText('onClickNode'));
  });

  it('should clicking on a edge', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText('onClickEdge'));
  });

  it('should select a Component from the toolbar', async () => {
    const handleSelected = jest.fn();

    jest.spyOn(useTopologySiteState, 'default').mockImplementation(() => ({
      idsSelected: TopologyController.transformStringIdsToIds(componentResult[2].identity),
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

    await eventUser.click(screen.getByDisplayValue(componentResult[2].name));
    await eventUser.click(screen.getByText(componentResult[3].name));

    expect(handleSelected).toHaveBeenCalled();
  });

  it('should save node positions and display info alert when handleSaveTopology is called', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(TopologyLabels.SaveButton));

    expect(screen.getByText(TopologyLabels.ToastSave)).toBeInTheDocument();
  });

  it('should update showOnlyNeighbours state on checkbox click', async () => {
    const handleShowOnlyNeighbours = jest.fn();

    jest.spyOn(useTopologySiteState, 'default').mockImplementation(() => ({
      idsSelected: TopologyController.transformStringIdsToIds(componentResult[2].identity),
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
});
