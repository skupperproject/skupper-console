import { createServer, Response } from 'miragejs';

const DELAY_RESPONSE = 250;

export function loadMockServer() {
    if (
        !process.env.API_HOST &&
        (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER)
    ) {
        const path = './data';
        const VANdata = require(`${path}/DATA.json`);
        const flowsData = require(`${path}/FLOWS.json`);

        createServer({
            routes() {
                this.timing = DELAY_RESPONSE;
                this.pretender.get('*', this.pretender.passthrough);
                // General APIs
                this.get(
                    '/error',
                    () => new Response(500, { some: 'header' }, { errors: ['Server Error'] }),
                );
                this.get('/DATA', () => VANdata);
                this.get('/api/v1alpha1/all', () => flowsData);
            },
        });
    }
}
