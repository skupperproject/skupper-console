import React from 'react';

import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
const TEST_ID_SITE_VIEW = 'sk-site-view';
const firstSiteName = sitesData.results[0].name;

describe('Begin testing the Sites component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should render a loading page when data is loading', () => {
    render(
      <Wrapper>
        <Sites />
      </Wrapper>
    );

    expect(screen.getByTestId(TEST_ID_LOADING_PAGE)).toBeInTheDocument();
  });

  it('should render the sites view after the data loading is complete', async () => {
    render(
      <Wrapper>
        <Sites />
      </Wrapper>
    );

    expect(screen.getByTestId(TEST_ID_LOADING_PAGE)).toBeInTheDocument();
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(screen.getByTestId(TEST_ID_SITES_VIEW)).toBeInTheDocument();
  });

  it('should render a table with the site data after the data has loaded.', async () => {
    render(
      <Wrapper>
        <Sites />
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));

    expect(screen.getByText(firstSiteName)).toBeInTheDocument();
  });

  it('should navigates to the site details view when a site link is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <Sites />
      </Wrapper>
    );

    await waitForElementToBeRemoved(() => screen.getByTestId(TEST_ID_LOADING_PAGE));
    // Simulate a click on the first site link and wait for the site details view to appear.
    await user.click(screen.getByText(firstSiteName));

    waitFor(() => expect(screen.getByTestId(TEST_ID_SITE_VIEW)).toBeInTheDocument());
  });
});
