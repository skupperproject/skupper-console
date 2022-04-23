import React from 'react';

import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HashRouter } from 'react-router-dom';

import App from '@core/components/App';

import { loadMockServer } from '../public/mocks/server.js';

const queryClient = new QueryClient();

render(
    <QueryClientProvider client={queryClient}>
        <HashRouter>
            <App />
        </HashRouter>
    </QueryClientProvider>,
    document.getElementById('app'),
);

loadMockServer();
