import { FC, forwardRef, memo, Suspense, useImperativeHandle } from 'react';

import { Button } from '@patternfly/react-core';
import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import servicesData from '@mocks/data/SERVICES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import TopologyProcesses from '../components/TopologyProcesses';
import { TopologyLabels } from '../Topology.enum';
import { NodeOrEdgeListProps } from '../Topology.interfaces';

const processesResults = processesData.results;
const servicesResults = servicesData.results;
const serviceIdSelected = servicesResults[2].identity;

const MockGraphComponent: FC<GraphReactAdaptorProps> = memo(
  forwardRef(({ onClickEdge, onClickNode, onClickCombo }, ref) => {
    useImperativeHandle(ref, () => ({
      saveNodePositions() {
        return jest.fn();
      }
    }));

    return (
      <>
        <Button onClick={() => onClickNode && onClickNode({ id: processesResults[0].identity })}>onClickNode</Button>
        <Button
          onClick={() =>
            onClickEdge &&
            onClickEdge({
              id: `${processesResults[2].identity}-to-${processesResults[1].identity}`,
              metrics: { protocol: 'http2' }
            })
          }
        >
          onClickEdge
        </Button>
        <Button onClick={() => onClickCombo && onClickCombo({ id: 'combo', label: 'combo' })}>onClickCombo</Button>
      </>
    );
  })
);

const MockTopologyModalComponent: FC<NodeOrEdgeListProps> = function ({ ids, items, modalType }) {
  return (
    <div>
      <div>Modal is open</div>
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
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologyProcesses
            serviceIds={[serviceIdSelected]}
            id={processesResults[2].name}
            GraphComponent={MockGraphComponent}
            ModalComponent={MockTopologyModalComponent}
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

  it('should save node positions and display info alert when handleSaveTopology is called', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(TopologyLabels.SaveButton));

    expect(screen.getByText(TopologyLabels.ToastSave)).toBeInTheDocument();
  });
});
