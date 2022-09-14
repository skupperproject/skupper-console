import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import App from '@core/components/App';
import { queryClientConfig } from 'config';

import { loadMockServer } from '../public/mocks/server.js';

const queryClient = new QueryClient(queryClientConfig);
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
