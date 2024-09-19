import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import { Protocols } from '@API/REST.enum';
import { getTestsIds } from '@config/testIds';
import { BiFlowLabels } from '@core/components/SkBiFlowDetails/BiFlow.enum';

import biFlowData from '../../mocks/data/FLOW_PAIRS.json';
import { loadMockServer } from '../../mocks/server';
import SkBiFlowDetails from '../../src/core/components/SkBiFlowDetails';
import { Wrapper } from '../../src/core/components/Wrapper';
import { BiFlowResponse } from '../../src/types/REST.interfaces';

describe('BiFlowDetails component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the http/2 Open Request', () => {
    render(
      <Wrapper>
        <SkBiFlowDetails biflow={biFlowData.results[0] as BiFlowResponse} />
      </Wrapper>
    );

    expect(screen.getByTestId(getTestsIds.biFlowView(biFlowData.results[0].identity))).toBeInTheDocument();
    expect(screen.getByText(BiFlowLabels.Terminated)).toBeInTheDocument();
    expect(screen.getByText(biFlowData.results[0].protocol)).toHaveTextContent(Protocols.Http2);
    expect(screen.getByText(BiFlowLabels.Method)).toBeInTheDocument();
    expect(screen.getByText(BiFlowLabels.Status)).toBeInTheDocument();
    expect(screen.queryByText(BiFlowLabels.Host)).not.toBeInTheDocument();
    expect(screen.queryByText(BiFlowLabels.ProxyHost)).not.toBeInTheDocument();
  });

  it('should render a Terminated Connection', () => {
    render(
      <Wrapper>
        <SkBiFlowDetails biflow={biFlowData.results[4] as BiFlowResponse} />
      </Wrapper>
    );

    expect(screen.getByText(BiFlowLabels.Closed)).toBeInTheDocument();
    expect(screen.getByText(biFlowData.results[4].protocol)).toHaveTextContent(Protocols.Tcp);
    expect(screen.getByText(BiFlowLabels.Trace)).toBeInTheDocument();
    expect(screen.getByText(BiFlowLabels.Duration)).toBeInTheDocument();
    expect(screen.getAllByText(BiFlowLabels.Host)[0]).toBeInTheDocument();
    expect(screen.getByText(BiFlowLabels.ProxyHost)).toBeInTheDocument();
  });

  it('should render an Open Connection', () => {
    render(
      <Wrapper>
        <SkBiFlowDetails biflow={biFlowData.results[3] as BiFlowResponse} />
      </Wrapper>
    );

    expect(screen.getByText(BiFlowLabels.Open)).toBeInTheDocument();
    expect(screen.getByText(biFlowData.results[3].protocol)).toHaveTextContent(Protocols.Tcp);
    expect(screen.getByText(BiFlowLabels.Trace)).toBeInTheDocument();
    expect(screen.getAllByText(BiFlowLabels.Host)[0]).toBeInTheDocument();
    expect(screen.getByText(BiFlowLabels.ProxyHost)).toBeInTheDocument();
    expect(screen.queryByText(BiFlowLabels.Duration)).not.toBeInTheDocument();
  });
});
