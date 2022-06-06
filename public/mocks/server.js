import { createServer, Response } from 'miragejs';

const DELAY_RESPONSE = 250;

export function loadMockServer() {
    if (
        !process.env.API_HOST &&
        (process.env.NODE_ENV === 'development' || !!process.env.ENABLE_MOCK_SERVER)
    ) {
        const path = './data';
        const VANdata = require(`${path}/DATA.json`);
        const topology = require(`${path}/FLOWS_TOPOLOGY.json`);
        const vanaddrs = require(`${path}/FLOWS_VANS.json`);
        const flowsMongo = require(`${path}/FLOWS_PER_MONGO_SITES.json`);
        const recordsMongo = require(`${path}/RECORDS_PER_MONGO_SITES.json`);

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
                this.get('/api/v1alpha1/topology', () => topology);
                this.get('/api/v1alpha1/vanaddrs', () => vanaddrs);
                this.get('/api/v1alpha1//flows', (_, { queryParams }) => {
                    if (queryParams.vanaddr) {
                        return flowsMongo[queryParams.vanaddr];
                    }
                });
                this.get('/api/v1alpha1/record', (_, { queryParams, ...rest }) => {
                    const ids = rest.url
                        .split('?')[1]
                        .split('&')
                        .flatMap((elem) => elem.split('id=').filter(Boolean));

                    if (queryParams.id) {
                        return recordsMongo
                            .filter(({ _id }) => ids.includes(_id))
                            .map((record) => record._record);
                    }
                });
            },
        });
    }
}
