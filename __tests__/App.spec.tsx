import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Server } from 'miragejs';

import App from 'App';

import { loadMockServer } from '../mocks/server';
import { getTestsIds } from '../src/config/testIds';
import { Wrapper } from '../src/core/components/Wrapper';

describe('Begin testing the App component', () => {
  let server: Server;

  beforeEach(() => {
    server = loadMockServer() as Server;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('should render the Components view after the data loading is complete', async () => {
    await waitFor(() => {
      render(
        <Wrapper>
          <App />
        </Wrapper>
      );
      expect(screen.getByTestId(getTestsIds.header())).toBeInTheDocument();
    });
  });
});
