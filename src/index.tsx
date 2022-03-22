import React from 'react';

import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

import App from 'App';

import { loadMockServerInDev } from '../public/mocks/server.js';
import GlobalStateProvider from './contexts/Data';

loadMockServerInDev();

const queryClient = new QueryClient();

render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <GlobalStateProvider>
        <App />
      </GlobalStateProvider>
    </BrowserRouter>
  </QueryClientProvider>,
  document.getElementById('app'),
);
