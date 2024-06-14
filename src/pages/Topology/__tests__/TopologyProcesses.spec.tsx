import { FC, forwardRef, memo, Suspense, useImperativeHandle } from 'react';

import { Button } from '@patternfly/react-core';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import eventUser from '@testing-library/user-event';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { ProcessPairsResponse, ProcessResponse, ServiceResponse } from '@API/REST.interfaces';
import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import { Wrapper } from '@core/components/Wrapper';
import processesPairsData from '@mocks/data/PROCESS_PAIRS.json';
import processesData from '@mocks/data/PROCESSES.json';
import servicesData from '@mocks/data/SERVICES.json';
import { loadMockServer } from '@mocks/server';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import LoadingPage from '@pages/shared/Loading';

import TopologyProcesses from '../components/TopologyProcesses';
import * as useServiceState from '../components/useTopologyServiceState';
import * as useTopologyState from '../components/useTopologyState';
import { TopologyController } from '../services';
import { SHOW_DEPLOYMENTS } from '../Topology.constants';
import { TopologyLabels } from '../Topology.enum';
import { NodeOrEdgeListProps } from '../Topology.interfaces';

const processesResults = processesData.results as ProcessResponse[];
const processesPairsResults = processesPairsData.results as ProcessPairsResponse[];
const serviceResults = servicesData.results as ServiceResponse[];

const mockNavigate = jest.fn();
const mockHandleSelected = jest.fn();
const mockHandleShowOnlyNeighbours = jest.fn();
const mockHandleMoveToNodeSelectedChecked = jest.fn();
const MockGetDisplaySelectedFromLocalStorage = jest.fn();

const mockUseTopologyStateResults = {
  idsSelected: TopologyController.transformStringIdsToIds(processesResults[0].identity),
  showOnlyNeighbours: false,
  moveToNodeSelected: false,
  displayOptionsSelected: [],
  handleSelected: mockHandleSelected,
  getDisplaySelectedFromLocalStorage: MockGetDisplaySelectedFromLocalStorage,
  handleShowOnlyNeighbours: mockHandleShowOnlyNeighbours,
  handleMoveToNodeSelectedChecked: mockHandleMoveToNodeSelectedChecked,
  handleDisplaySelected: jest.fn()
};

const mockHandleServiceSelected = jest.fn();
const mockGetServiceIdsFromLocalStorage = jest.fn();

const mockUseServiceStateResults = {
  serviceIdsSelected: undefined,
  handleServiceSelected: mockHandleServiceSelected,
  saveServiceIdsToLocalStorage: jest.fn(),
  getServiceIdsFromLocalStorage: mockGetServiceIdsFromLocalStorage
};

const MockGraphComponent: FC<GraphReactAdaptorProps> = memo(
  forwardRef(({ onClickEdge, onClickNode, onClickCombo }, ref) => {
    useImperativeHandle(ref, () => ({
      saveNodePositions() {
        return jest.fn();
      }
    }));

    return (
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
        <Button onClick={() => onClickCombo && onClickCombo({ id: 'combo', label: 'combo' })}>onClickCombo</Button>
      </>
    );
  })
);

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

  it('should clicking on a node with a group of IDs', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => ({
      ...mockUseTopologyStateResults,
      idSelected: TopologyController.transformStringIdsToIds(
        `${processesResults[0].identity}~${processesResults[2].identity}`
      )
    }));

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.queryByTestId('sk-topology-details')).not.toBeInTheDocument();

    const mockClick = screen.getByText('onClickNodeDeployment');

    await eventUser.click(mockClick);
    expect(mockHandleSelected).toHaveBeenCalledWith([
      `${processesResults[0].identity}~${processesResults[2].identity}`
    ]);

    expect(screen.queryByTestId('sk-topology-details')).toBeInTheDocument();
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
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => ({
      ...mockUseTopologyStateResults,
      idSelected: TopologyController.transformStringIdsToIds(
        `${processesPairsResults[0].identity}~${processesPairsResults[2].identity}`
      )
    }));

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.queryByTestId('sk-topology-details')).not.toBeInTheDocument();

    const mockClick = screen.getByText('onClickEdgeDeployment');

    await eventUser.click(mockClick);
    expect(mockHandleSelected).toHaveBeenCalledWith([
      `${processesPairsResults[0].identity}~${processesPairsResults[2].identity}`
    ]);

    expect(screen.getByTestId('sk-topology-details')).toBeInTheDocument();
  });

  it('should save node positions and display info alert when handleSaveTopology is called', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText(TopologyLabels.SaveButton));
    expect(screen.getByText(TopologyLabels.ToastSave)).toBeInTheDocument();
  });

  it('should load node positions and display info alert when handleLoadTopology is called', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => mockUseTopologyStateResults);
    jest.spyOn(useServiceState, 'default').mockImplementation(() => mockUseServiceStateResults);

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByText(TopologyLabels.LoadButton));
    expect(screen.getByText(TopologyLabels.ToastLoad)).toBeInTheDocument();
    expect(mockGetServiceIdsFromLocalStorage).toHaveBeenCalled();
    expect(MockGetDisplaySelectedFromLocalStorage).toHaveBeenCalled();
  });

  it('should select a process from the toolbar', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => mockUseTopologyStateResults);

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(screen.getByDisplayValue(processesResults[0].name));
    await eventUser.click(screen.getByText(processesResults[3].name));

    expect(mockHandleSelected).toHaveBeenCalledWith([processesResults[3].identity]);
  });

  it('should select a deployment from the toolbar', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => ({
      ...mockUseTopologyStateResults,
      idSelected: TopologyController.transformStringIdsToIds(
        `${processesResults[0].identity}~${processesResults[2].identity}`
      ),
      displayOptionsSelected: [SHOW_DEPLOYMENTS]
    }));

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    await eventUser.click(
      screen.getByDisplayValue(`${processesResults[2].groupName}-${processesResults[2].parentName}`)
    );
    await eventUser.click(screen.getByText(`${processesResults[0].groupName}-${processesResults[0].parentName}`));

    expect(mockHandleSelected).toHaveBeenCalledWith([
      `${processesResults[0].identity}~${processesResults[2].identity}`
    ]);
  });

  it('should update showOnlyNeighbours state on checkbox click', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => mockUseTopologyStateResults);

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const checkbox = screen
      .getByTestId('show-only-neighbours-checkbox')
      .querySelector('input[type="checkbox') as HTMLInputElement;

    await eventUser.click(checkbox);

    expect(mockHandleShowOnlyNeighbours).toHaveBeenCalled();
  });

  it('should update moveToNodeSelected state on checkbox click', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => mockUseTopologyStateResults);

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const checkbox = screen
      .getByTestId('move-to-node-selected-checkbox')
      .querySelector('input[type="checkbox') as HTMLInputElement;

    await eventUser.click(checkbox);
    expect(mockHandleMoveToNodeSelectedChecked).toHaveBeenCalled();
  });

  it('should select a service from the toolbar', async () => {
    jest.spyOn(useTopologyState, 'default').mockImplementation(() => mockUseTopologyStateResults);
    jest.spyOn(useServiceState, 'default').mockImplementation(() => mockUseServiceStateResults);

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    // the service select load data asyncronously compared to the rest of the view
    const placeHolderText = `0 services selected`;
    expect(screen.queryByPlaceholderText(placeHolderText)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(placeHolderText)).not.toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(`${serviceResults.length} services selected`)).toBeInTheDocument();
    await eventUser.click(screen.getByPlaceholderText(`${serviceResults.length} services selected`));
    await eventUser.click(await screen.findByText(serviceResults[0].name));

    expect(mockHandleSelected).toHaveBeenCalledWith();

    const idsSelected = serviceResults
      .map(({ identity }) => identity)
      .filter((id) => id !== serviceResults[0].identity);
    expect(mockHandleServiceSelected).toHaveBeenCalledWith(idsSelected);
  });
});
