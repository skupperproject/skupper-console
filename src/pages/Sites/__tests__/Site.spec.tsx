import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { ProcessResponse, SiteResponse } from '@API/REST.interfaces';
import { waitForElementToBeRemovedTimeout } from '@config/config';
import { getTestsIds } from '@config/testIds';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import sitesData from '@mocks/data/SITES.json';
import { loadMockServer } from '@mocks/server';
import LoadingPage from '@pages/shared/Loading';

import { SiteLabels } from '../Sites.enum';
import Site from '../views/Site';

const siteResults = sitesData.results as SiteResponse[];
const processResults = processesData.results as ProcessResponse[];

describe('Site component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
    // Mock URL query parameters and inject them into the component
    jest.spyOn(router, 'useParams').mockReturnValue({ id: `${siteResults[0].name}@${siteResults[0].identity}` });

    render(
      <Wrapper>
        <Suspense fallback={<LoadingPage />}>
          <Site />
        </Suspense>
      </Wrapper>
    );
  });

  afterEach(() => {
    fireEvent.click(screen.getByText(SiteLabels.Overview));

    server.shutdown();
    jest.clearAllMocks();
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

    fireEvent.click(screen.getByText(SiteLabels.Details));

    await waitFor(() => {
      expect(screen.getByText(siteResults[0].name)).toBeInTheDocument();
      expect(screen.getByText(siteResults[0].nameSpace)).toBeInTheDocument();
      expect(screen.getByText(processResults[0].name)).toBeInTheDocument();
    });
  });

  it('Should ensure the Site details component renders with correct link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(SiteLabels.Details));

    await waitFor(() => {
      expect(screen.getByRole('link', { name: processResults[0].name })).toHaveAttribute(
        'href',
        `#/processes/${processResults[0].name}@${processResults[0].identity}`
      );
    });
  });
});
