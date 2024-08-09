import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import flowPairsData from '../../mocks/data/FLOW_PAIRS.json';
import { loadMockServer } from '../../mocks/server';
import { FlowPairsResponse } from '../../src/API/REST.interfaces';
import { getTestsIds } from '../../src/config/testIds';
import { Wrapper } from '../../src/core/components/Wrapper';
import FlowPair from '../../src/pages/shared/FlowPairs/FlowPair';

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
        <FlowPair flowPair={flowPairsData.results[0] as FlowPairsResponse} />
      </Wrapper>
    );

    expect(screen.getByTestId(getTestsIds.flowPairsView(flowPairsData.results[0].identity))).toBeInTheDocument();
  });

  it('should render the TCP FlowPair view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <FlowPair flowPair={flowPairsData.results[3] as FlowPairsResponse} />
      </Wrapper>
    );

    expect(screen.getByTestId(getTestsIds.flowPairsView(flowPairsData.results[3].identity))).toBeInTheDocument();
  });
});
