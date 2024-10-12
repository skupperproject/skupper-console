import { Suspense, memo, forwardRef, useImperativeHandle, FC } from 'react';

import { Button } from '@patternfly/react-core';
import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { convertComponentToNode } from '@pages/Topology/services/topologyComponentController';
import { ComponentResponse, PairsResponse } from '@sk-types/REST.interfaces';

import componentPairsData from '../../../mocks/data/PROCESS_GROUP_PAIRS.json';
import componentData from '../../../mocks/data/PROCESS_GROUPS.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import LoadingPage from '../../../src/pages/shared/Loading';
import TopologyComponent from '../../../src/pages/Topology/components/TopologyComponent';
import { TopologyController } from '../../../src/pages/Topology/services';
import { SkGraphProps } from '../../../src/types/Graph.interfaces';

const componentResult = componentData.results as ComponentResponse[];
const componentPairsResult = componentPairsData.results as PairsResponse[];

const MockGraphComponent: FC<SkGraphProps> = memo(
  forwardRef(({ onClickEdge, onClickNode }, ref) => {
    useImperativeHandle(ref, () => ({
      saveNodePositions() {
        return jest.fn();
      }
    }));

    return (
      <>
        <Button onClick={() => onClickNode && onClickNode(convertComponentToNode(componentResult[0]))}>
          onClickNode
        </Button>
        <Button
          onClick={() =>
            onClickEdge && onClickEdge(TopologyController.convertPairToEdge(componentPairsResult[2], 'SkDataEdge'))
          }
        >
          onClickEdge
        </Button>
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
});
