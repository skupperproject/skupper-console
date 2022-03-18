import React from 'react';

import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import GlobalStateProvider from './contexts/Data';
import { loadMockServerInDev } from './mock/server';

loadMockServerInDev();

const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <GlobalStateProvider>
        <App />
      </GlobalStateProvider>
    </BrowserRouter>
  </QueryClientProvider>,
  document.getElementById('app'),
);
