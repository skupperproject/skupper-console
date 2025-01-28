import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// import processesData from '../mocks/data/PROCESSES.json';
import sitesData from '../mocks/data/SITES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { Labels } from '../src/config/labels';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import Site from '../src/pages/Sites/views/Site';
import { Providers } from '../src/providers';
import { SiteResponse } from '../src/types/REST.interfaces';
import { setMockUseParams } from '../vite.setup';

const siteResults = sitesData.results as SiteResponse[];
// const processResults = processesData.results as ProcessResponse[];

setMockUseParams({ id: `${siteResults[0].name}@${siteResults[0].identity}` });

describe('Site component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Site />
        </Suspense>
      </Providers>
    );
  });

  afterEach(() => {
    fireEvent.click(screen.getByText(Labels.Overview));

    server.shutdown();
    vi.clearAllMocks();
  });

  it('should render the sites view after the data loading is complete', async () => {
    // Wait for all queries to resolve
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getByTestId(getTestsIds.siteView(siteResults[0].identity))).toBeInTheDocument();
  });

  it('should render the title, description data and processes associated the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(Labels.Details));

    await waitFor(() => {
      expect(screen.getByText(siteResults[0].namespace)).toBeInTheDocument();
      expect(screen.getByText(siteResults[0].name)).toBeInTheDocument();
      expect(screen.getByText(siteResults[0].platform as string)).toBeInTheDocument();
      expect(screen.getByText(siteResults[0].version)).toBeInTheDocument();
    });
  });

  it('Should ensure the Site processes component renders with correct link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(Labels.Processes));

    // await waitFor(() => {
    //   const container = screen.getByTestId(processResults[1].name);
    //   const link = container.querySelector('a');
    //   expect(link).toHaveAttribute(
    //     'href',
    //     `#${ProcessesRoutesPaths.Processes}/${processResults[1].name}@${processResults[1].identity}`
    //   );
    // });
  });
});
