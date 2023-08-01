import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Server } from 'miragejs';

import { getTestsIds } from '@config/testIds.config';
import { Wrapper } from '@core/components/Wrapper';
import { loadMockServer } from '@mocks/server';

import App from '../App';

describe('Begin testing the App component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;

    render(
      <Wrapper>
        <App />
      </Wrapper>
    );
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Components view after the data loading is complete', async () => {
    expect(screen.getByTestId(getTestsIds.loadingView())).toBeInTheDocument();
    // Wait for the loading page to disappear before continuing with the test.
    await waitForElementToBeRemoved(() => screen.getByTestId(getTestsIds.loadingView()));

    expect(screen.getByTestId(getTestsIds.header())).toBeInTheDocument();
  });
});
