import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import linksData from '../mocks/data/LINKS.json';
import sitesData from '../mocks/data/SITES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import { SkEmptyDataLabels } from '../src/core/components/SkEmptyData';
import LoadingPage from '../src/core/components/SkLoading';
import Links from '../src/pages/Sites/components/Links';
import { Providers } from '../src/providers';

const site = sitesData.results[0];

describe('Links component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('should render outgoing and incoming links for dallas site', async () => {
    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Links site={site} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const outgoingLink = linksData.results.find((link) => link.sourceSiteId === site.identity);
    expect(screen.getByText(Labels.OutLinks)).toBeInTheDocument();
    expect(screen.getByText(outgoingLink!.name)).toBeInTheDocument();
    expect(screen.getByText(outgoingLink!.destinationSiteName)).toBeInTheDocument();

    const incomingLink = linksData.results.find((link) => link.destinationSiteId === site.identity);
    expect(screen.getByText(Labels.InLinks)).toBeInTheDocument();
    expect(screen.getByText(incomingLink!.name)).toBeInTheDocument();
    expect(screen.getByText(incomingLink!.sourceSiteName)).toBeInTheDocument();
  });

  it('should show only outgoing links for malaga site', async () => {
    const malagaSite = sitesData.results[2];

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Links site={malagaSite} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    const malagaLinks = linksData.results.filter((link) => link.sourceSiteId === malagaSite.identity);
    malagaLinks.forEach((link) => {
      expect(screen.getByText(link.name)).toBeInTheDocument();
      expect(screen.getByText(link.destinationSiteName)).toBeInTheDocument();
    });

    const incomingLink = linksData.results.find((link) => link.destinationSiteId === malagaSite.identity);
    expect(screen.getByText(Labels.InLinks)).toBeInTheDocument();
    expect(screen.getByText(incomingLink!.name)).toBeInTheDocument();
    expect(screen.getByText(incomingLink!.sourceSiteName)).toBeInTheDocument();
  });

  it('should show empty state when no links are available', async () => {
    const parisSite = sitesData.results[4];

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Links site={parisSite} />
        </Suspense>
      </Providers>
    );

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByText(SkEmptyDataLabels.Default)).toBeInTheDocument();
    expect(screen.queryByText(Labels.OutLinks)).not.toBeInTheDocument();
    expect(screen.queryByText(Labels.InLinks)).not.toBeInTheDocument();
  });
});
