import { FC, memo, Suspense } from 'react';

import { Button } from '@patternfly/react-core';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import eventUser from '@testing-library/user-event';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { ProcessPairsResponse, ProcessResponse, ServiceResponse } from '@API/REST.interfaces';
import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { SkGraphProps } from '@core/components/SkGraph/Graph.interfaces';
import { Wrapper } from '@core/components/Wrapper';
import processesPairsData from '@mocks/data/PROCESS_PAIRS.json';
import processesData from '@mocks/data/PROCESSES.json';
import servicesData from '@mocks/data/SERVICES.json';
import { loadMockServer } from '@mocks/server';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import LoadingPage from '@pages/shared/Loading';
import TopologyProcesses from '@pages/Topology/components/TopologyProcesses';
import * as useTopologyState from '@pages/Topology/components/useTopologyState';
import { TopologyController } from '@pages/Topology/services';
import { TopologyLabels } from '@pages/Topology/Topology.enum';
import { NodeOrEdgeListProps } from '@pages/Topology/Topology.interfaces';

const processesResults = processesData.results as ProcessResponse[];
const processesPairsResults = processesPairsData.results as ProcessPairsResponse[];
const serviceResults = servicesData.results as ServiceResponse[];

const mockNavigate = jest.fn();
const mockHandleSelected = jest.fn();
const mockHandleSearchText = jest.fn();
const mockHandleShowOnlyNeighbours = jest.fn();
const mockHandleMoveToNodeSelectedChecked = jest.fn();

const mockUseTopologyStateResults = {
  idsSelected: TopologyController.transformStringIdsToIds(processesResults[0].identity),
  searchText: '',

  displayOptionsSelected: [],
  handleSelected: mockHandleSelected,
  handleSearchText: mockHandleSearchText,
  handleShowOnlyNeighbours: mockHandleShowOnlyNeighbours,
  handleMoveToNodeSelectedChecked: mockHandleMoveToNodeSelectedChecked,
  handleDisplaySelected: jest.fn()
};

const MockGraphComponent: FC<SkGraphProps> = memo(({ onClickEdge, onClickNode }) => (
  <>
    <Button onClick={() => onClickNode && onClickNode(processesResults[0].identity)}>onClickNode</Button>
    <Button
      onClick={() => onClickNode && onClickNode(`${processesResults[0].identity}~${processesResults[2].identity}`)}
    >
      onClickNodeDeployment
    </Button>
    <Button onClick={() => onClickEdge && onClickEdge(processesPairsResults[0].identity)}>onClickEdge</Button>
    <Button
      onClick={() =>
        onClickEdge && onClickEdge(`${processesPairsResults[0].identity}~${processesPairsResults[2].identity}`)
      }
    >
      onClickEdgeDeployment
    </Button>
  </>
));

const MockTopologyModalComponent: FC<NodeOrEdgeListProps> = function ({ ids, items, modalType }) {
  return (
    <div data-testid="sk-topology-details">
      <div>{TopologyLabels.TopologyModalTitle}</div>
      <div>{`Modal type: ${modalType}`}</div>
      <div>{`Selected ids: ${ids}`}</div>
      <div>{`Selected items: ${items}`}</div>
    </div>
  );
};

describe('Topology Process', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    jest.spyOn(router, 'useNavigate').mockImplementation(() => mockNavigate);

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologyProcesses
            ids={TopologyController.transformStringIdsToIds(processesResults[2].name)}
            GraphComponent={MockGraphComponent}
            ModalComponent={MockTopologyModalComponent}
            serviceIds={serviceResults.map(({ identity }) => identity)}
          />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should clicking on a node with a single ID', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => mockUseTopologyStateResults);

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const mockClick = screen.getByText('onClickNode');

    await eventUser.click(mockClick);
    expect(mockNavigate).toHaveBeenCalledWith(
      `${ProcessesRoutesPaths.Processes}/${processesResults[0].name}@${processesResults[0].identity}`
    );
  });

  it('should clicking on a edge', async () => {
    const pair = processesPairsResults[0];
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const mockClick = screen.getByText('onClickEdge');

    await eventUser.click(mockClick);

    expect(mockNavigate).toHaveBeenCalledWith(
      `${ProcessesRoutesPaths.Processes}/${pair.sourceName}@${pair.sourceId}/${ProcessesLabels.ProcessPairs}@${pair.identity}@${pair.protocol}`
    );
  });

  it('should clicking on a edge with a group of pairIDs', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => mockUseTopologyStateResults);

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const mockClick = screen.getByText('onClickEdgeDeployment');

    await eventUser.click(mockClick);

    expect(mockHandleSelected).toHaveBeenCalledWith([
      `${processesPairsResults[0].identity}~${processesPairsResults[2].identity}`
    ]);
  });
});
