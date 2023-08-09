import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import flowPairsData from '@mocks/data/FLOW_PAIRS.json';
import { loadMockServer } from '@mocks/server';

import FlowPair from '../FlowPair';

describe('FlowPairs component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the HTTP/2 FlowPair view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <FlowPair flowPairId={flowPairsData.results[0].identity} />
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    expect(screen.getByTestId(getTestsIds.flowPairsView(flowPairsData.results[0].identity))).toBeInTheDocument();
  });

  it('should render the TCP FlowPair view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <FlowPair flowPairId={flowPairsData.results[3].identity} />
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    expect(screen.getByTestId(getTestsIds.flowPairsView(flowPairsData.results[3].identity))).toBeInTheDocument();
  });
});
