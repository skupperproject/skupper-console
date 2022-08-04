import { RESTApi } from 'API/REST';
import { FlowResponse, FlowsDeviceResponse, FlowsSiteResponse } from 'API/REST.interfaces';

import {
    MonitoringTopology,
    VanAddresses,
    ExtendedConnectionFlows,
    ConnectionsBasic,
} from './services.interfaces';

export const MonitorServices = {
    fetchVanAddresses: async (): Promise<VanAddresses[]> => RESTApi.fetchVanAddresses(),

    // TODO: waiting for the API to remove multiple calls and filters
    fetchFlowsByVanAddressId: async (
        id: string,
        currentPage: number,
        visibleItems: number,
        filters: { shouldShowActiveFlows?: boolean },
    ): Promise<ConnectionsBasic> => {
        const flows = await RESTApi.fetchFlowsByVanAddr(id);

        // filter collection
        const flowsFiltered = flows
            .sort((a, b) => b.startTime - a.startTime)
            .filter((flow) => !(filters.shouldShowActiveFlows && flow.endTime));

        const startOffset = (currentPage - 1) * visibleItems;
        //paginate collection
        const flowsPaginated = flowsFiltered.filter(
            (_, index) => index >= startOffset && index < startOffset + visibleItems,
        );

        const connections = await Promise.all(
            flowsPaginated.map(async (flow) => {
                const process = await RESTApi.fetchFlowProcess(flow.process);

                const site = await RESTApi.fetchFlowsSite(process.parent);

                const counterFlow = flow.counterFlow;

                if (counterFlow) {
                    const targetFlow = flows.find(
                        ({ identity }) => identity === counterFlow,
                    ) as FlowResponse;

                    const targetProcess = await RESTApi.fetchFlowProcess(targetFlow.process);

                    const targetSite = await RESTApi.fetchFlowsSite(targetProcess.parent);

                    return {
                        ...flow,
                        siteName: site.name,
                        processName: process.name,
                        targetSiteName: targetSite.name,
                        targetProcessName: targetProcess.name,
                    };
                }

                return {
                    ...flow,
                    siteName: site.name,
                    processName: process.name,
                };
            }),
        );

        return { connections, total: flowsFiltered.length };
    },

    fetchConnectionByFlowId: async (id: string): Promise<ExtendedConnectionFlows> => {
        const startFlow = (await RESTApi.fetchFlow(id)) as FlowResponse;

        const { counterFlow, parent } = startFlow;

        const startListener = await RESTApi.fetchFlowsListener(parent);
        const startConnector = await RESTApi.fetchFlowsConnector(parent);
        const startDevice = { ...startListener, ...startConnector } as FlowsDeviceResponse;

        const startRouter = await RESTApi.fetchFlowsRouter(startDevice.parent);

        const startSite = (await RESTApi.fetchFlowsSite(startRouter.parent)) as FlowsSiteResponse;
        const startProcess = await RESTApi.fetchFlowProcess(startFlow.process);

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

            const endListener = await RESTApi.fetchFlowsListener(endParent);
            const endConnector = await RESTApi.fetchFlowsConnector(endParent);

            const endFlowsDevice = { ...endListener, ...endConnector } as FlowsDeviceResponse;
            const endRouter = await RESTApi.fetchFlowsRouter(endFlowsDevice.parent);

            const endSite = (await RESTApi.fetchFlowsSite(endRouter.parent)) as FlowsSiteResponse;
            const endProcess = await RESTApi.fetchFlowProcess(endFlow.process);

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
