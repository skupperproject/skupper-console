import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { ProcessResponse, SiteResponse } from '@API/REST.interfaces';
import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import sitesData from '@mocks/data/SITES.json';
import { loadMockServer } from '@mocks/server';

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
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the sites view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <Site />
      </Wrapper>
    );
    // Wait for all queries to resolve
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByTestId(getTestsIds.siteView(siteResults[0].identity))).toBeInTheDocument();
  });

  it('should render the title, description data and processes associated the data loading is complete', async () => {
    render(
      <Wrapper>
        <Site />
      </Wrapper>
    );
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByText(siteResults[0].name)).toBeInTheDocument();
    expect(screen.getByText(siteResults[0].nameSpace)).toBeInTheDocument();
    expect(screen.getByText(processResults[0].name)).toBeInTheDocument();
  });

  it('Should ensure the Site details component renders with correct link href after loading page', async () => {
    render(
      <Wrapper>
        <Site />
      </Wrapper>
    );
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByRole('link', { name: processResults[0].name })).toHaveAttribute(
      'href',
      `#/processes/${processResults[0].name}@${processResults[0].identity}`
    );
  });
});
