import { RESTApi } from 'API/REST';

import { Network } from './network.interfaces';

export const NetworkServices = {
    fetchNetworkStats: async function (): Promise<Network> {
        const [routersStats, networkStats] = await Promise.all([
            RESTApi.fetchFlowsRoutersStats(),
            RESTApi.fetchFlowsNetworkStats(),
        ]);

        return { routersStats, networkStats };
    },
};
