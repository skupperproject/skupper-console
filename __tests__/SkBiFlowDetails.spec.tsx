import { render, screen } from '@testing-library/react';
import { Server } from 'miragejs';

import httpRequests from '../mocks/data/HTTP_REQUESTS.json';
import tcpConnections from '../mocks/data/TCP_CONNECTIONS.json';
import { loadMockServer } from '../mocks/server';
import { Protocols } from '../src/API/REST.enum';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import SkBiFlowDetails from '../src/core/components/SkBiFlowDetails';
import { Providers } from '../src/providers';
import { ApplicationFlowResponse, BiFlowResponse } from '../src/types/REST.interfaces';

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
      <Providers>
        <SkBiFlowDetails biflow={httpRequests.results[0] as ApplicationFlowResponse} />
      </Providers>
    );

    expect(screen.getByTestId(getTestsIds.biFlowView(httpRequests.results[0].identity))).toBeInTheDocument();
    expect(screen.getByText(Labels.Terminated)).toBeInTheDocument();
    expect(screen.getByText(httpRequests.results[0].protocol)).toHaveTextContent(Protocols.Http2);
    expect(screen.getByText(Labels.Method)).toBeInTheDocument();
    expect(screen.getByText(Labels.Status)).toBeInTheDocument();
    expect(screen.queryByText(Labels.Node)).not.toBeInTheDocument();
    expect(screen.queryByText(Labels.ProxyNode)).not.toBeInTheDocument();
  });

  it('should render a Terminated Connection', () => {
    render(
      <Providers>
        <SkBiFlowDetails biflow={tcpConnections.results[5] as BiFlowResponse} />
      </Providers>
    );

    expect(screen.getByText(Labels.Closed)).toBeInTheDocument();
    expect(screen.getByText(tcpConnections.results[4].protocol)).toHaveTextContent(Protocols.Tcp);
    expect(screen.getByText(Labels.Trace)).toBeInTheDocument();
    expect(screen.getByText(Labels.Duration)).toBeInTheDocument();
    expect(screen.getAllByText(Labels.Node)[0]).toBeInTheDocument();
    expect(screen.getByText(Labels.ProxyNode)).toBeInTheDocument();
  });

  it('should render an Open Connection', () => {
    render(
      <Providers>
        <SkBiFlowDetails biflow={tcpConnections.results[3] as BiFlowResponse} />
      </Providers>
    );

    expect(screen.getByText(Labels.Open)).toBeInTheDocument();
    expect(screen.getByText(tcpConnections.results[3].protocol)).toHaveTextContent(Protocols.Tcp);
    expect(screen.getByText(Labels.Trace)).toBeInTheDocument();
    expect(screen.getAllByText(Labels.Node)[0]).toBeInTheDocument();
    expect(screen.getByText(Labels.ProxyNode)).toBeInTheDocument();
    expect(screen.queryByText(Labels.Duration)).not.toBeInTheDocument();
  });
});
