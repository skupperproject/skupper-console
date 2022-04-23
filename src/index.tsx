import React from 'react';

import { createServer, Response } from 'miragejs';
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

if (!(window as any).Cypress) {
    if (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER) {
        loadMockServer();
    }
}

if ((window as any).Cypress) {
    const otherDomains: any = [];
    const methods = ['get', 'put', 'patch', 'post', 'delete'];

    createServer({
        routes() {
            for (const domain of ['/', ...otherDomains]) {
                for (const method of methods) {
                    (this as any)[method](`${domain}*`, async (schema: any, request: any) => {
                        const [status, headers, body] = await (window as any).handleFromCypress(
                            request,
                        );

                        return new Response(status, headers, body);
                    });
                }
            }
        },
    });
}
