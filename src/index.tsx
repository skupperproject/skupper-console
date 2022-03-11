import React from 'react';

import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import GlobalStateProvider from './contexts/Data';
import { loadMockServerInDev } from './mock/server';

loadMockServerInDev();

ReactDOM.render(
  <BrowserRouter>
    <GlobalStateProvider>
      <App />
    </GlobalStateProvider>
  </BrowserRouter>,
  document.getElementById('app'),
);
