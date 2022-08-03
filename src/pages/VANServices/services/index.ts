import { RESTApi } from 'API/REST';
import {
    FlowResponse,
    FlowsDeviceResponse,
    FlowsProcessResponse,
    FlowsRouterResponse,
    FlowsSiteResponse,
} from 'API/REST.interfaces';

import { MonitoringTopology, VanAddresses, ExtendedConnectionFlows } from './services.interfaces';

export interface ConnectionsPaginated {
    connections: FlowResponse[];
    total: number;
}

export const MonitorServices = {
    fetchVanAddresses: async (): Promise<VanAddresses[]> => RESTApi.fetchVanAddresses(),

    fetchFlowsByVanAddressId: async (
        id: string,
        currentPage: number,
        visibleItems: number,
        filters: { shouldShowActiveFlows?: boolean },
    ): Promise<ConnectionsPaginated> => {
        const flows = await RESTApi.fetchFlowsByVanAddr(id);

        const flowsFiltered = flows
            .sort((a, b) => b.startTime - a.startTime)
            .filter((flow) => !(filters.shouldShowActiveFlows && flow.endTime));

        const startOffset = (currentPage - 1) * visibleItems;
        const flowsPaginated = flowsFiltered.filter(
            (_, index) => index >= startOffset && index < startOffset + visibleItems,
        );

        const connections = flowsPaginated.map((flow) => {
            const counterFlow = flow.counterFlow;

            if (counterFlow) {
                const targetFlow = flows.find(({ identity }) => identity === counterFlow);

                return { ...flow, targetFlow };
            }

            return { ...flow };
        });

        return { connections, total: flowsFiltered.length };
    },

    fetchConnectionByFlowId: async (id: string): Promise<ExtendedConnectionFlows> => {
        const startFlow = (await RESTApi.fetchFlow(id)) as FlowResponse;

        const { counterFlow, parent } = startFlow;

        const startListener = await RESTApi.fetchFlowsListener(parent);
        const startConnector = await RESTApi.fetchFlowsConnector(parent);
        const startDevice = { ...startListener, ...startConnector } as FlowsDeviceResponse;

        const startRouter = (await RESTApi.fetchFlowsRouter(
            startDevice.parent,
        )) as FlowsRouterResponse;

        const startSite = (await RESTApi.fetchFlowsSite(startRouter.parent)) as FlowsSiteResponse;
        const startProcess = (await RESTApi.fetchFlowProcess(
            startFlow.process,
        )) as FlowsProcessResponse;

        const start = {
            ...startFlow,
            device: startDevice,
            router: startRouter,
            site: startSite,
            processFlow: startProcess,
            parentType: startDevice.recType,
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
            const endProcess = (await RESTApi.fetchFlowProcess(
                endFlow.process,
            )) as FlowsProcessResponse;

            const end = {
                ...endFlow,
                device: endFlowsDevice,
                router: endRouter,
                site: endSite,
                processFlow: endProcess,
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

    fetchConnectionTopology: async (): Promise<MonitoringTopology> => RESTApi.fetchFlowsTopology(),
};
