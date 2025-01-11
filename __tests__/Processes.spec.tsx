import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import processesData from '../mocks/data/PROCESSES.json';
import { loadMockServer } from '../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../src/config/app';
import { getTestsIds } from '../src/config/testIds';
import LoadingPage from '../src/core/components/SkLoading';
import { ComponentRoutesPaths } from '../src/pages/Components/Components.enum';
import Processes from '../src/pages/Processes/views/Processes';
import { SitesRoutesPaths } from '../src/pages/Sites/Sites.enum';
import { Providers } from '../src/providers';

const processesResults = processesData.results;

describe('Begin testing the Processes component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Providers>
        <Suspense fallback={<LoadingPage />}>
          <Processes />
        </Suspense>
      </Providers>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render a loading page when data is loading', () => {
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
  });

  it('should render the Processes view after the data loading is complete', async () => {
    expect(screen.queryByTestId(getTestsIds.loadingView())).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });
    expect(screen.getByTestId(getTestsIds.processesView())).toBeInTheDocument();
  });

  // it('should render a table with the Processes data after the data has loaded.', async () => {
  //   await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
  //     timeout: waitForElementToBeRemovedTimeout
  //   });

  //   expect(screen.getByText(processesResults[0].name)).toBeInTheDocument();
  // });

  it('Should ensure the Processes component renders with correct Component link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByRole('link', { name: processesResults[0].groupName })[0]).toHaveAttribute(
      'href',
      `#${ComponentRoutesPaths.Components}/${processesResults[0].groupName}@${processesResults[0].groupIdentity}`
    );
  });

  it('Should ensure the Processes component renders with correct Site link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    expect(screen.getAllByRole('link', { name: processesResults[0].parentName })[0]).toHaveAttribute(
      'href',
      `#${SitesRoutesPaths.Sites}/${processesResults[0].parentName}@${processesResults[0].parent}`
    );
  });

  // it('Should ensure the Processes component renders with correct Name link href after loading page', async () => {
  //   await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
  //     timeout: waitForElementToBeRemovedTimeout
  //   });

  //   expect(screen.getByRole('link', { name: processesResults[0].name })).toHaveAttribute(
  //     'href',
  //     `#${ProcessesRoutesPaths.Processes}/${processesResults[0].name}@${processesResults[0].identity}`
  //   );
  // });
});
