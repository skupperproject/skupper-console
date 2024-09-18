import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import biFlowData from '../../mocks/data/FLOW_PAIRS.json';
import { loadMockServer } from '../../mocks/server';
import { getTestsIds } from '../../src/config/testIds';
import BiFlowDetails from '../../src/core/components/SkBiFlowDetails';
import { Wrapper } from '../../src/core/components/Wrapper';
import { BiFlowResponse } from '../../src/types/REST.interfaces';

describe('SkBiflow component', () => {
  let server: Server;
  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the HTTP/2 BiFlow view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <BiFlowDetails biflow={biFlowData.results[0] as BiFlowResponse} />
      </Wrapper>
    );

    expect(screen.getByTestId(getTestsIds.biFlowView(biFlowData.results[0].identity))).toBeInTheDocument();
  });

  it('should render the TCP BiFlow view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <BiFlowDetails biflow={biFlowData.results[3] as BiFlowResponse} />
      </Wrapper>
    );

    expect(screen.getByTestId(getTestsIds.biFlowView(biFlowData.results[3].identity))).toBeInTheDocument();
  });
});
