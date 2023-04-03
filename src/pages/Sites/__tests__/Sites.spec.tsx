import React from 'react';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

// Import required test data and server mocks.
import { Wrapper } from '@core/Wrapper';
import sitesData from '@mocks/data/SITES.json';
import { loadMockServer } from '@mocks/server';

// Import the component being tested.
import Sites from '../views/Sites';

// Define constants to identify specific elements in the rendered component.
const TEST_ID_LOADING_PAGE = 'sk-loading-page';
const TEST_ID_SITES_VIEW = 'sk-sites-view';
const siteResults = sitesData.results;

describe('Begin testing the Sites component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;

    render(
      <Wrapper>
        <Sites />
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should render a loading page when data is loading', () => {
    expect(screen.getByTestId(TEST_ID_LOADING_PAGE)).toBeInTheDocument();
  });

  it('should render the sites view after the data loading is complete', async () => {
    expect(screen.getByTestId(TEST_ID_LOADING_PAGE)).toBeInTheDocument();
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(screen.getByTestId(TEST_ID_SITES_VIEW)).toBeInTheDocument();
  });

  it('should render a table with the site data after the data has loaded.', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(screen.getByText(siteResults[0].name)).toBeInTheDocument();
  });

  it('should navigates to the site details view when a site link is clicked', async () => {
    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(screen.getByRole('link', { name: siteResults[0].name })).toHaveAttribute(
      'href',
      `#/sites/${siteResults[0].name}@${siteResults[0].identity}`
    );
  });
});
