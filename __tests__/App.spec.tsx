import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import App from 'App';
import { Server } from 'miragejs';

import { loadMockServer } from '../mocks/server';
import { getTestsIds } from '../src/config/testIds';
import { Providers } from '../src/providers';

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
        <Providers>
          <App />
        </Providers>
      );
      expect(screen.getByTestId(getTestsIds.header())).toBeInTheDocument();
    });
  });
});
