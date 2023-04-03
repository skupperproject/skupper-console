import React from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';
import * as Router from 'react-router';

import { ProcessResponse, SiteResponse } from '@API/REST.interfaces';
import { Wrapper } from '@core/Wrapper';
import processesData from '@mocks/data/PROCESSES.json';
import sitesData from '@mocks/data/SITES.json';
import { loadMockServer } from '@mocks/server';

import Site from '../views/Site';

const TEST_ID_LOADING_PAGE = 'sk-loading-page';
const TEST_ID_SITE_VIEW = 'sk-site-view';

const siteResults = sitesData.results as SiteResponse[];
const processResults = processesData.results as ProcessResponse[];

describe('Site component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    jest.spyOn(Router, 'useParams').mockReturnValue({ id: `${siteResults[0].name}@${siteResults[0].identity}` });

    render(
      <Wrapper>
        <Site />
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the sites view after the data loading is complete', async () => {
    // Wait for all queries to resolve
    expect(screen.getByTestId(TEST_ID_LOADING_PAGE)).toBeInTheDocument();
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(screen.getByTestId(`${TEST_ID_SITE_VIEW}-${siteResults[0].identity}`)).toBeInTheDocument();
  });

  it('should render the title, description data and processes associated the data loading is complete', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(screen.getByText(siteResults[0].name)).toBeInTheDocument();
    expect(screen.getByText(siteResults[0].nameSpace)).toBeInTheDocument();
    expect(screen.getByText(processResults[0].name)).toBeInTheDocument();
  });

  it('should navigates to the process details view when a process link is clicked', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(screen.getByRole('link', { name: processResults[0].name })).toHaveAttribute(
      'href',
      `#/processes/${processResults[0].name}@${processResults[0].identity}`
    );
  });
});
