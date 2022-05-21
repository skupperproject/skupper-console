import React from 'react';

import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HashRouter } from 'react-router-dom';

import App from '@core/components/App';

import { loadMockServer } from '../public/mocks/server.js';

const queryClient = new QueryClient();
const rootElement = document.getElementById('app') as HTMLDivElement;
const root = createRoot(rootElement);

root.render(
    <QueryClientProvider client={queryClient}>
        <HashRouter>
            <App />
        </HashRouter>
    </QueryClientProvider>,
);

loadMockServer();
