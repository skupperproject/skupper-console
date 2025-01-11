import { FC, memo, Suspense } from 'react';

import { Button } from '@patternfly/react-core';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import eventUser from '@testing-library/user-event';
import { Server } from 'miragejs';

import { mockNavigate } from '../jest.setup';
import processesPairsData from '../mocks/data/PROCESS_PAIRS.json';
import processesData from '../mocks/data/PROCESSES.json';
import servicesData from '../mocks/data/SERVICES.json';
import { loadMockServer } from '../mocks/server';
import { extendedProcessResponse } from '../mocks/server.API';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import { ProcessesRoutesPaths } from '../src/pages/Processes/Processes.enum';
import { TopoloyDetailsProps } from '../src/pages/Topology/components/TopologyDetails';
import TopologyProcesses from '../src/pages/Topology/components/TopologyProcesses';
import * as useTopologyState from '../src/pages/Topology/hooks/useTopologyState';
import { TopologyController } from '../src/pages/Topology/services';
import { convertProcessToNode } from '../src/pages/Topology/services/topologyProcessController';
import { Providers } from '../src/providers';
import { SkGraphProps } from '../src/types/Graph.interfaces';
import { ProcessPairsResponse, ServiceResponse } from '../src/types/REST.interfaces';

const processesResults = processesData.results as extendedProcessResponse[];
const processesPairsResults = processesPairsData.results as ProcessPairsResponse[];
const serviceResults = servicesData.results as ServiceResponse[];

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

const groupedIds = `${processesResults[0].identity}~${processesResults[2].identity}`;
const MockGraphComponent: FC<SkGraphProps> = memo(({ onClickEdge, onClickNode }) => (
  <>
    <Button onClick={() => onClickNode && onClickNode(convertProcessToNode(processesResults[0]))}>onClickNode</Button>
    <Button
      onClick={() => onClickNode && onClickNode(convertProcessToNode({ ...processesResults[0], identity: groupedIds }))}
    >
      onClickNodeDeployment
    </Button>
    <Button
      onClick={() =>
        onClickEdge && onClickEdge(TopologyController.convertPairToEdge(processesPairsResults[0], 'SkDataEdge'))
      }
    >
      onClickEdge
    </Button>
    <Button
      onClick={() =>
        onClickEdge &&
        onClickEdge(
          TopologyController.convertPairToEdge({ ...processesPairsResults[0], identity: groupedIds }, 'SkDataEdge')
        )
      }
    >
      onClickEdgeDeployment
    </Button>
  </>
));

const MockTopologyModalComponent: FC<TopoloyDetailsProps> = function ({ ids, items, modalType }) {
  return (
    <div data-testid="sk-topology-details">
      <div>{Labels.Details}</div>
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

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <TopologyProcesses
            ids={TopologyController.transformStringIdsToIds(processesResults[2].name)}
            GraphComponent={MockGraphComponent}
            ModalComponent={MockTopologyModalComponent}
            serviceIds={serviceResults.map(({ identity }) => identity)}
          />
        </Suspense>
      </Providers>
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
      `${ProcessesRoutesPaths.Processes}/${pair.sourceName}@${pair.sourceId}/${Labels.Pairs}@${pair.identity}`
    );
  });

  it('should clicking on a node with a group of pairIDs', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => mockUseTopologyStateResults);

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const mockClick = screen.getByText('onClickNodeDeployment');

    await eventUser.click(mockClick);

    expect(mockHandleSelected).toHaveBeenCalledWith([groupedIds]);
  });

  it('should clicking on a edge with a group of pairIDs', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => mockUseTopologyStateResults);

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const mockClick = screen.getByText('onClickEdgeDeployment');

    await eventUser.click(mockClick);

    expect(mockHandleSelected).toHaveBeenCalledWith([groupedIds]);
  });
});
