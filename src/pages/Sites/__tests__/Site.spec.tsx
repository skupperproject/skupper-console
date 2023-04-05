import React from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as router from 'react-router';

import { ProcessResponse, SiteResponse } from '@API/REST.interfaces';
import { Wrapper } from '@core/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import sitesData from '@mocks/data/SITES.json';
import { MockApi, MockApiPaths, loadMockServer } from '@mocks/server';
import { ErrorServerRoutesPaths } from '@pages/shared/Errors/Server/Server.enum';

import Site from '../views/Site';

const TEST_ID_LOADING_PAGE = 'sk-loading-page';
const TEST_ID_SITE_VIEW = 'sk-site-view';

const siteResults = sitesData.results as SiteResponse[];
const processResults = processesData.results as ProcessResponse[];

describe('Site component', () => {
  let server: Server;
  const mockedNavigator = jest.fn();

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
    expect(screen.getByTestId(TEST_ID_LOADING_PAGE)).toBeInTheDocument();
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(screen.getByTestId(`${TEST_ID_SITE_VIEW}-${siteResults[0].identity}`)).toBeInTheDocument();
  });

  it('should render the title, description data and processes associated the data loading is complete', async () => {
    render(
      <Wrapper>
        <Site />
      </Wrapper>
    );
    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

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
    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(screen.getByRole('link', { name: processResults[0].name })).toHaveAttribute(
      'href',
      `#/processes/${processResults[0].name}@${processResults[0].identity}`
    );
  });

  it('Should call the useNavigate function with the path to an error page when a 500 error is received from the site details', async () => {
    server.get(MockApiPaths.Site, MockApi.get500Error);
    jest.spyOn(router, 'useNavigate').mockImplementation(() => mockedNavigator);

    render(
      <Wrapper
        config={{
          defaultOptions: {
            queries: {
              retry: false
            }
          }
        }}
      >
        <Site />
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(mockedNavigator).toHaveBeenCalledWith(ErrorServerRoutesPaths.ErrServer);
  });
});
