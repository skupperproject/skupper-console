import { Suspense, memo, forwardRef, useImperativeHandle, FC } from 'react';

import { Button } from '@patternfly/react-core';
import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import { Wrapper } from '@core/components/Wrapper';
import sitesData from '@mocks/data/PROCESS_GROUPS.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import TopologyProcessGroups from '../components/TopologyProcessGroups';
import { TopologyLabels } from '../Topology.enum';

const sitesResults = sitesData.results;

const MockGraphComponent: FC<GraphReactAdaptorProps> = memo(
  forwardRef(({ onClickEdge, onClickNode, onClickCombo }, ref) => {
    useImperativeHandle(ref, () => ({
      saveNodePositions() {
        return jest.fn();
      }
    }));

    return (
      <>
        <Button onClick={() => onClickNode && onClickNode({ id: sitesResults[0].identity })}>onClickNode</Button>
        <Button
          onClick={() =>
            onClickEdge &&
            onClickEdge({
              id: `${sitesResults[2].identity}-to-${sitesResults[1].identity}`,
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

describe('Topology Components', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <TopologyProcessGroups id={sitesResults[2].name} GraphComponent={MockGraphComponent} />
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
