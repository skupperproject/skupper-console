import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import servicesData from '../mocks/data/SERVICES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import Service from '../src/pages/Services/views/Service';
import { Providers } from '../src/providers';
import { setMockUseParams } from '../vite.setup';

const servicesResults = servicesData.results;

vi.mock('@nivo/sankey', () => ({
  ResponsiveSankey: () => <div />
}));

vi.mock('../src/core/components/SkGraph', () => ({
  default: <div />
}));

describe('Begin testing the Service component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    setMockUseParams({
      id: `${servicesResults[0].name}@${servicesResults[0].identity}`
    });

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Service />
        </Suspense>
      </Providers>
    );
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('should render the TCP Service view after the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(Labels.Overview)).toBeInTheDocument();
    expect(screen.getByText(`${Labels.Pairs}`)).toBeInTheDocument();
    expect(screen.getByText(`${Labels.OpenConnections}`)).toBeInTheDocument();
    expect(screen.getByText(`${Labels.OldConnections}`)).toBeInTheDocument();
  });

  it('should render the HTTP/2 Service view after the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    setMockUseParams({
      id: `${servicesResults[2].name}@${servicesResults[2].identity}`
    });

    expect(screen.getByText(Labels.Overview)).toBeInTheDocument();
    expect(screen.getByText(`${Labels.Pairs}`)).toBeInTheDocument();
  });

  it('should clicking on a tab will result in the server tab being highlighted', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(Labels.Pairs));

    expect(screen.getByText(`${Labels.Pairs}`).parentNode?.parentNode).toHaveRole(`presentation`);
  });
});
