import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import connectorsData from '../mocks/data/CONNECTORS.json';
import listenersData from '../mocks/data/LISTENERS.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import ListenerAndConnector from '../src/pages/Services/components/ListenerAndConnector';
import { getConnectorBaseName } from '../src/pages/Services/services';
import { Providers } from '../src/providers';
import { GraphCombo, GraphEdge, GraphNode } from '../src/types/Graph.interfaces';

vi.mock('../src/core/components/SkGraph', () => ({
  default: ({ nodes, edges, combos }: { nodes: GraphNode[]; edges: GraphEdge[]; combos: GraphCombo[] }) => (
    <div data-testid="sk-graph-mock">
      <div data-testid="nodes">{JSON.stringify(nodes)}</div>
      <div data-testid="edges">{JSON.stringify(edges)}</div>
      <div data-testid="combos">{JSON.stringify(combos)}</div>
    </div>
  )
}));

describe('ListenerAndConnector', () => {
  let server: Server;
  const service = {
    id: listenersData.results[0].serviceId,
    name: 'test-service'
  };

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should render the component after data loading is complete', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <ListenerAndConnector {...service} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByTestId('sk-graph-mock')).toBeInTheDocument();
    expect(screen.getByTestId('nodes')).toBeInTheDocument();
    expect(screen.getByTestId('edges')).toBeInTheDocument();
    expect(screen.getByTestId('combos')).toBeInTheDocument();

    const serviceListeners = listenersData.results.filter((listener) => listener.serviceId === service.id);
    if (serviceListeners.length) {
      expect(screen.getByText(Labels.Listeners)).toBeInTheDocument();
      serviceListeners.forEach((listener) => {
        expect(screen.getAllByText(listener.name)[0]).toBeInTheDocument();
      });
    }

    const serviceConnectors = connectorsData.results.filter((connector) => connector.serviceId === service.id);
    if (serviceConnectors.length) {
      expect(screen.getByText(Labels.Connectors)).toBeInTheDocument();
      serviceConnectors.forEach((connector) => {
        expect(screen.getAllByText(getConnectorBaseName(connector.name))[0]).toBeInTheDocument();
      });
    }
  });

  it('should show empty graph when no data is available', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <ListenerAndConnector id="empty-service" name="empty-service" />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByTestId('edges')).toHaveTextContent('[]');
    expect(screen.getByTestId('combos')).toHaveTextContent('[]');
  });

  it('should display correct topology data for service', async () => {
    const serviceId = listenersData.results[0].serviceId;

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <ListenerAndConnector id={serviceId} name="test-service" />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const graph = screen.getByTestId('sk-graph-mock');
    expect(graph).toBeInTheDocument();

    const nodesData = JSON.parse(screen.getByTestId('nodes').textContent || '[]');
    const edgesData = JSON.parse(screen.getByTestId('edges').textContent || '[]');

    expect(nodesData).toHaveLength(6);
    expect(edgesData).toHaveLength(5);
  });
});
