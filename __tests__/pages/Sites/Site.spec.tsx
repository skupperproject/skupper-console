import { Suspense } from 'react';

import { fireEvent, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { ProcessesRoutesPaths } from '../../../src/pages/Processes/Processes.enum';

import processesData from '../../../mocks/data/PROCESSES.json';
import sitesData from '../../../mocks/data/SITES.json';
import { loadMockServer } from '../../../mocks/server';
import { waitForElementToBeRemovedTimeout } from '../../../src/config/config';
import { getTestsIds } from '../../../src/config/testIds';
import { Wrapper } from '../../../src/core/components/Wrapper';
import LoadingPage from '../../../src/pages/shared/Loading';
import { SiteLabels } from '../../../src/pages/Sites/Sites.enum';
import Site from '../../../src/pages/Sites/views/Site';
import { ProcessResponse, SiteResponse } from '../../../src/types/REST.interfaces';

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
      expect(screen.getByText(siteResults[0].nameSpace)).toBeInTheDocument();
      expect(screen.getByText(siteResults[0].name)).toBeInTheDocument();
      expect(screen.getByText(siteResults[0].platform as string)).toBeInTheDocument();
      expect(screen.getByText(siteResults[0].siteVersion)).toBeInTheDocument();
    });
  });

  it('Should ensure the Site processes component renders with correct link href after loading page', async () => {
    await waitForElementToBeRemoved(() => screen.queryByTestId(getTestsIds.loadingView()), {
      timeout: waitForElementToBeRemovedTimeout
    });

    fireEvent.click(screen.getByText(SiteLabels.Processes));

    await waitFor(() => {
      expect(screen.getByText(processResults[0].name)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('link', { name: processResults[0].name })).toHaveAttribute(
        'href',
        `#${ProcessesRoutesPaths.Processes}/${processResults[0].name}@${processResults[0].identity}`
      );
    });
  });
});
