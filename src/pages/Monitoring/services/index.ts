import { RESTApi } from 'API/REST';
import {
    FlowResponse,
    FlowsDeviceResponse,
    FlowsResponse,
    FlowsRouterResponse,
    FlowsSiteResponse,
} from 'API/REST.interfaces';

import { MonitoringTopology, VanAddresses, ExtendedConnectionFlows } from './services.interfaces';

export const MonitorServices = {
    fetchVanAddresses: async (): Promise<VanAddresses[]> => RESTApi.fetchVanAddresses(),

    fetchFlowsByVanAddressId: async (id: string): Promise<FlowResponse[]> => {
        const flows = await RESTApi.fetchFlowsByVanAddr(id);

        return flows.map((flow) => {
            const counterFlow = flow.counterFlow;

            if (counterFlow) {
                const targetFlow = flows.find(({ identity }) => identity === counterFlow);

                return { ...flow, targetFlow };
            }

            return { ...flow };
        });
    },

    fetchConnectionByFlowId: async (id: string): Promise<ExtendedConnectionFlows> => {
        const startFlow = (await RESTApi.fetchFlow(id)) as FlowResponse;

        const { counterFlow, parent } = startFlow;

        const startLink = await RESTApi.fetchFlowsListener(parent);
        const startConnector = await RESTApi.fetchFlowsConnector(parent);

        const startFlowsDevice = { ...startLink, ...startConnector } as FlowsDeviceResponse;
        const startRouter = (await RESTApi.fetchFlowsRouter(
            startFlowsDevice.parent,
        )) as FlowsRouterResponse;

        const startSite = (await RESTApi.fetchFlowsSite(startRouter.parent)) as FlowsSiteResponse;

        const start = {
            ...startFlow,
            device: startFlowsDevice,
            router: startRouter,
            site: startSite,
            parentType: startFlowsDevice.recType,
        };

        if (counterFlow) {
            const endFlow = (await RESTApi.fetchFlow(counterFlow)) as FlowResponse;

            const { parent: endParent } = endFlow;

            const endLink = await RESTApi.fetchFlowsListener(endParent);
            const endConnector = await RESTApi.fetchFlowsConnector(endParent);

            const endFlowsDevice = { ...endLink, ...endConnector } as FlowsDeviceResponse;
            const endRouter = (await RESTApi.fetchFlowsRouter(
                endFlowsDevice.parent,
            )) as FlowsRouterResponse;

            const endSite = (await RESTApi.fetchFlowsSite(endRouter.parent)) as FlowsSiteResponse;

            const end = {
                ...endFlow,
                device: endFlowsDevice,
                router: endRouter,
                site: endSite,
                parentType: endFlowsDevice.recType,
            };

            return {
                startFlow: start,
                endFlow: end,
            };
        }

        return {
            startFlow: start,
            endFlow: null,
        };
    },

    fetchFlowsByVanId: async (id: string): Promise<FlowsResponse[] | null> =>
        id ? RESTApi.fetchMonitoringFlowsByVanId(id) : null,

    fetchFlowsTopology: async (): Promise<MonitoringTopology> => RESTApi.fetchFlowsTopology(),
};
