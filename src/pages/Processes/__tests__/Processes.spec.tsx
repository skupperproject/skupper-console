import { Suspense } from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import Processes from '../views/Processes';

const processesResults = processesData.results;

describe('Begin testing the Processes component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Processes />
        </Suspense>
      </Wrapper>
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
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));
    expect(screen.getByTestId(getTestsIds.processesView())).toBeInTheDocument();
  });

  it('should render a table with the Processes data after the data has loaded.', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(processesResults[0].name)).toBeInTheDocument();
  });

  it('Should ensure the Processes component renders with correct Name link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByRole('link', { name: processesResults[0].name })).toHaveAttribute(
      'href',
      `#/processes/${processesResults[0].name}@${processesResults[0].identity}`
    );
  });

  it('Should ensure the Processes component renders with correct Component link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getAllByRole('link', { name: processesResults[0].groupName })[0]).toHaveAttribute(
      'href',
      `#/components/${processesResults[0].groupName}@${processesResults[0].groupIdentity}`
    );
  });

  it('Should ensure the Processes component renders with correct Site link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getAllByRole('link', { name: processesResults[0].parentName })[0]).toHaveAttribute(
      'href',
      `#/sites/${processesResults[0].parentName}@${processesResults[0].parent}`
    );
  });
});
